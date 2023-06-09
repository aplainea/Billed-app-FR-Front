/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockedStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            //to-do write expect expression
            expect(windowIcon.classList.contains("active-icon")).toBe(true);
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            // const antiChrono = (a, b) => (a < b ? 1 : -1); // Old version
            const antiChrono = (a, b) => a - b;

            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });

    describe("When I click on the New Bill button", () => {
        test("Then it should navigate to the NewBill route", () => {
            // Création d'un mock pour la fonction onNavigate
            const onNavigateMock = jest.fn();

            // Création d'une instance de la classe Bills avec les valeurs nécessaires pour le test
            const bills = new Bills({
                document,
                onNavigate: onNavigateMock,
                store: null,
                localStorage: null,
            });

            // Appel de la méthode handleClickNewBill pour simuler un clic sur le bouton New Bill
            bills.handleClickNewBill();

            // Vérification que la fonction onNavigate a été appelée avec la bonne route (NewBill)
            expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
        });
    });

    describe("When I click on one eye icon", () => {
        test("Then a modal should open", async () => {
            // Définir une fonction simulée pour gérer la navigation
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            // Simuler l'objet localStorage
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            // Définir un utilisateur simulé dans localStorage
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            // Créer une instance de la page Bills avec des dépendances simulées
            const billsPage = new Bills({
                document,
                onNavigate,
                store: mockedStore,
                localStorage: window.localStorage,
            });

            // Définir le contenu HTML initial de la page Bills
            document.body.innerHTML = BillsUI({ data: bills });
            // Sélectionner toutes les icônes d'œil à l'aide d'un attribut de test
            const icon = screen.getAllByTestId("icon-eye");

            // Créer une fonction simulée pour gérer le clic sur l'icône d'œil
            const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);

            // Sélectionner la modale en utilisant son identifiant
            const modale = document.getElementById("modaleFile");

            // Simuler la fonction modal de Bootstrap pour ajouter la classe "show" à la modale
            $.fn.modal = jest.fn(() => modale.classList.add("show")); //mock de la modale Bootstrap

            // Ajouter un gestionnaire d'événement pour chaque icône d'œil
            icon.forEach((icon) => {
                icon.addEventListener("click", () => handleClickIconEye(icon));
                // Simuler un clic sur l'icône d'œil
                userEvent.click(icon);

                // Vérifier que la fonction handleClickIconEye a été appelée
                expect(handleClickIconEye).toHaveBeenCalled();

                // Vérifier que la modale a la classe "show" après le clic
                expect(modale.classList.contains("show")).toBe(true);
            });
        });
    });
});
