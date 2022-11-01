fetch("https://p5-demo.onrender.com/api/products/")
    .then(function(response) {
        if (response.ok)
            return response.json();
        else
            throw "Something went wrong with the request to get all the products from the API";
    })
    .then(displayAllProducts)
    .catch(function(error) {
        let container = document.getElementById("items");
        let errorMessage = document.createElement("div");
        errorMessage.setAttribute("style", "text-align: center; font-size: 24px");
        errorMessage.textContent = "Notre site est momentanément indisponible. Revenez bientôt !";
        container.appendChild(errorMessage);
        console.log(error);
    });

function displayAllProducts(products){
    let items = document.getElementById("items");
    for (let product of products) {
        items.innerHTML += `
            <a href="./product.html?id=${product._id}">
                <article>
                    <img src="${product.imageUrl}" alt="${product.altTxt}">
                    <h3 class="productName">${product.name}</h3>
                    <p class="productDescription">${product.description}</p>
                </article>
            </a>
        `;
    }
};