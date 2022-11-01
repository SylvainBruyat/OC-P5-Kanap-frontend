let CART_ITEMS_SECTION = document.getElementById("cart__items");
let CART = JSON.parse(localStorage.getItem("cart")) ?? []; // Permet de créer un tableau vide si le panier n'existe pas dans le localStorage
let TOTAL_PRICE = 0;
let TOTAL_QUANTITY = 0;

if (CART.length === 0) {
    displayEmptyCartMessage();
}
else {
    displayProducts(CART);
}

function displayEmptyCartMessage() {
    let container = document.getElementById("cartAndFormContainer");
    let nextChild = document.querySelector(".cart");
    let emptyCartMessage = document.createElement("div");
    emptyCartMessage.innerHTML = `
        <p style="text-align: center;">Votre panier est vide.</p>
        <p style="text-align: center; margin-bottom: 40px;">
            N'hésitez pas à consulter notre 
            <a href="./index.html" style="color: white;" onMouseOver="this.style.fontWeight='bold'" onMouseOut="this.style.fontWeight='normal'">
            page d'accueil</a>
             pour voir tous nos produits.
        </p>
    `;
    container.insertBefore(emptyCartMessage, nextChild);
}

async function displayProducts(products) {
    CART_ITEMS_SECTION.innerHTML = ``;

    // Remise à zéro des totaux de prix et quantité. Permet d'avoir des totaux corrects si le panier est vide après suppression du dernier produit
    TOTAL_PRICE = 0;
    TOTAL_QUANTITY = 0;
    displayTotalPriceAndQuantity(TOTAL_PRICE, TOTAL_QUANTITY);

    try {
        for (let cartProduct of products) {
            let apiProduct = await fetch(`https://p5-demo.onrender.com/api/products/${cartProduct.id}`)
            .then(response => response.json());
            CART_ITEMS_SECTION.innerHTML += `
                <article class="cart__item" data-id="${cartProduct.id}" data-color="${cartProduct.color}">
                    <div class="cart__item__img">
                        <img src="${apiProduct.imageUrl}" alt="${apiProduct.altTxt}">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${apiProduct.name}</h2>
                            <p>${cartProduct.color}</p>
                            <p>${apiProduct.price} €</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                                <p>Qté : </p>
                                <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${cartProduct.quantity}">
                            </div>
                            <div class="cart__item__content__settings__delete">
                                <p class="deleteItem">Supprimer</p>
                            </div>
                        </div>
                    </div>
                </article>
            `;
            displayTotalPriceAndQuantity(apiProduct.price, cartProduct.quantity);
        }

        let deleteButtons = document.getElementsByClassName("deleteItem");
        for (let button of deleteButtons) {
            button.addEventListener("click", removeProduct);
        }
        let quantityInputs = document.getElementsByClassName("itemQuantity");
        for (let input of quantityInputs) {
            input.addEventListener("change", quantityChange);
        }
    }
    catch (error) {
        console.log(error);
    }
}

function displayTotalPriceAndQuantity(price, quantity) {
    TOTAL_PRICE += (price * quantity);
    TOTAL_QUANTITY += Number.parseInt(quantity, 10);
    document.getElementById("totalPrice").textContent = TOTAL_PRICE;
    document.getElementById("totalQuantity").textContent = TOTAL_QUANTITY;
}

function removeProduct(event) {
    let targetItem = event.target.closest("article");
    CART = CART.filter(p => !((p.id == targetItem.dataset.id) && (p.color == targetItem.dataset.color)));
    localStorage.setItem("cart", JSON.stringify(CART));
    displayProducts(CART); //Permet de réafficher les produits restants dans le panier et de recalculer les prix et quantité totaux
}

function quantityChange(event) {
    let targetItem = event.target.closest("article");

    // Si la quantité saisie par l'utilisateur n'est pas un entier supérieur ou égal à 0, remet la quantité précédente
    if (!/^[0-9]+$/.test(event.target.value)) {
        let productInCart = CART.find(p => (p.id == targetItem.dataset.id) && (p.color == targetItem.dataset.color));
        event.target.value = productInCart.quantity;
    }

    // Ramène la quantité à 1 si l'utilisateur a saisi 0. Ramène à 100 si l'utilisateur a saisi un nombre > 100.
    else if ((event.target.value < 1) || (event.target.value > 100))
        event.target.value = Math.max(1, Math.min(100, event.target.value));

    for (let product of CART) {
        if (product.id == targetItem.dataset.id && product.color == targetItem.dataset.color) {
            let deltaQuantity = event.target.value - product.quantity;
            product.quantity = event.target.value;
            //Récupère le prix du produit affiché sur la page car il n'est pas disponible dans l'objet "product" venant du localStorage
            let productPrice = parseInt(targetItem.querySelector(".cart__item__content__description p:nth-of-type(2)").textContent, 10);
            displayTotalPriceAndQuantity(productPrice, deltaQuantity);
        }
    }
    localStorage.setItem("cart", JSON.stringify(CART));
}

let SUBMIT_BUTTON = document.getElementById("order");
SUBMIT_BUTTON.addEventListener("click", function(event) {
    event.preventDefault();
    let formIsValid = validateOrderForm();
    if (formIsValid) {
        let requestBody = assembleOrderData(CART);
        postOrderRequest(requestBody);
    }
});

function validateOrderForm() {
    let formValidity = true;

    if (CART.length === 0) {
        let container = document.querySelector(".cart__order__form");
        let orderErrorMessage = document.createElement("div");
        orderErrorMessage.setAttribute("style", "margin-top: 20px; text-align: center; color: darkorange;")
        orderErrorMessage.textContent = "Commande impossible. Votre panier est vide";
        container.appendChild(orderErrorMessage);
        return formValidity = false;
    }

    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let address = document.getElementById("address").value;
    let city = document.getElementById("city").value;
    let email = document.getElementById("email").value;

    if(!/^[\p{L}]{1}[\p{L} -]+$/u.test(firstName)) {
        document
            .getElementById("firstNameErrorMsg")
            .textContent = "Veuillez saisir un prénom commençant par une lettre et uniquement composé de lettres, espaces et tirets";
        formValidity = false;
    }
    else {
        document.getElementById("firstNameErrorMsg").textContent = "";
    }

    if(!/^[\p{L}]{1}[\p{L}' -]+$/u.test(lastName)) {
        document
            .getElementById("lastNameErrorMsg")
            .textContent = "Veuillez saisir un nom de famille commençant par une lettre et uniquement composé de lettres, espaces, apostrophes et tirets";
        formValidity = false;
    }
    else {
        document.getElementById("lastNameErrorMsg").textContent = "";
    }

    if(!/^[\p{L}\d]{1}[\p{L}\d' ,.-]+$/u.test(address)) {
        document
            .getElementById("addressErrorMsg")
            .textContent = "Veuillez saisir une adresse commençant par un chiffre ou une lettre et uniquement composée de chiffres, lettres, espaces, apostrophes, virgules, points et tirets";
        formValidity = false;
    }
    else {
        document.getElementById("addressErrorMsg").textContent = "";
    }

    if(!/^[\p{L}]{1}[\p{L}' -]+$/u.test(city)) {
        document
            .getElementById("cityErrorMsg")
            .textContent = "Veuillez saisir un nom de ville commençant par une lettre et uniquement composé de lettres, espaces, apostrophes et tirets";
        formValidity = false;
    }
    else {
        document.getElementById("cityErrorMsg").textContent = "";
    }

    if(!/^[\w.-]*@[\w.-]*.[a-zA-Z]{2,}$/.test(email)) {
        document
            .getElementById("emailErrorMsg")
            .textContent = "Veuillez saisir une adresse email valide sans caractères accentués (ex. : adresse_mail.2@exemple.xyz)";
        formValidity = false;
    }
    else {
        document.getElementById("emailErrorMsg").textContent = "";
    }

    return formValidity;
}

function assembleOrderData(cart) {
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let address = document.getElementById("address").value;
    let city = document.getElementById("city").value;
    let email = document.getElementById("email").value;

    let contact = {firstName, lastName, address, city, email}
    let products = cart.map(p => p.id);

    return {contact, products};
}

function postOrderRequest(requestBody) {
    try {
        fetch("https://p5-demo.onrender.com/api/products/order/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestBody)
        })
        .then(function(response) {
            if (response.status == 201)
                return response.json();
            else
                throw "The order could not be processed by the API. Please verify the content of the POST request";
        })
        .then(function(data) {
            localStorage.removeItem("cart");
            window.location = `./confirmation.html?orderid=${data.orderId}`;
        })
    }
    catch (error) {
        console.log(error);
    }
}