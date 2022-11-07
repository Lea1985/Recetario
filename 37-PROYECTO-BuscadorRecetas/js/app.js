function iniciarApp() {

    const resultado = document.querySelector("#resultado");

    const modal = new bootstrap.Modal("#modal", {});

    const selectCategorias = document.querySelector("#categorias");


    if (selectCategorias) {

        selectCategorias.addEventListener("change", seleccionarCategoria);
        obtenerCategorias();

    }

    const favoritosDiv = document.querySelector(".favoritos");



    if (favoritosDiv) {



        obtenerFavoritos();


    }

    function obtenerCategorias() {

        const url = "https://www.themealdb.com/api/json/v1/1/categories.php";

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarCategorias(resultado.categories))
    }

    function mostrarCategorias(categorias = []) {
        categorias.forEach(categoria => {

            const { strCategory } = categoria;
            const option = document.createElement("OPTION");
            option.value = strCategory;
            option.textContent = strCategory;
            selectCategorias.appendChild(option);
        })
    }

    function seleccionarCategoria(e) {
        const categoria = e.target.value;
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetas(resultado.meals))
    }


    function mostrarRecetas(recetas = []) {

        console.log(typeof recetas);

        limpiarHTML(resultado);

        console.log(recetas.length)

        const heading = document.createElement("H2");
        heading.classList.add("text-center", "text-black", "my-5");
        heading.textContent = recetas.length ? "Resultados" : "No hay resoltados";
        resultado.appendChild(heading);

        recetas.forEach(receta => {

            const { idMeal, strMeal, strMealThumb } = receta;
            const recetaContenedor = document.createElement("DIV");
            recetaContenedor.classList.add("col-md-4");

            const recetaCard = document.createElement("DIV");
            recetaCard.classList.add("card", "mb-4");

            const recetaImagen = document.createElement("IMG");
            recetaImagen.classList.add("card-img-top");
            recetaImagen.alt = `Imagen de la Receta ${strMeal}`;
            recetaImagen.src = strMealThumb ? strMealThumb : receta.img;

            const recetaCardBody = document.createElement("DIV");
            recetaCardBody.classList.add("card-body");

            const recetaHeading = document.createElement("H3");
            recetaHeading.classList.add("card-title", "mb-3");
            recetaHeading.textContent = strMeal ? strMeal : receta.titulo;

            const recetaButton = document.createElement("BUTTON");

            recetaButton.classList.add("btn", "btn-danger", "w-100");
            recetaButton.textContent = "Ver receta";
            // recetaButton.dataset.bsTarget = "#modal";
            // recetaButton.dataset.bsToggle = "modal";
            recetaButton.onclick = function() {
                seleccionarReceta(idMeal ? idMeal : receta.id);
            }

            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultado.appendChild(recetaContenedor);


        })


    }

    function seleccionarReceta(id) {
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`

        fetch(url)
            .then(respuesta => respuesta.json())
            .then(resultado => mostrarRecetaModal(resultado.meals[0]))
    }

    function mostrarRecetaModal(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        // Cargar los daos de la receta al modal
        const modalTittle = document.querySelector(".modal .modal-title");
        const modalBody = document.querySelector(".modal .modal-body");

        modalTittle.textContent = strMeal;
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="${strMeal}" />
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <H3 class="my-3">Ingredientes - Cantidades</h3>
        `


        const listGroup = document.createElement("UL");
        listGroup.classList.add("list-group");

        //  mostrar cantidades e ingrediente

        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement("LI");
                ingredienteLi.classList.add("list-group-item")
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`;

                listGroup.appendChild(ingredienteLi);

            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector(".modal-footer");

        limpiarHTML(modalFooter);

        // Botones de cerrar y favorito

        const btnFavotiro = document.createElement("BUTTON");
        btnFavotiro.classList.add("btn", "btn-danger", "col");
        btnFavotiro.textContent = existeStorage(idMeal) ? "Eliminar favorito" : "Guardar Favorito";

        //  localStorage

        btnFavotiro.onclick = function() {

            if (existeStorage(idMeal)) {

                eliminarFavorito(idMeal);

                btnFavotiro.textContent = "Guardar Favorito";

                mostrarToast("Eliminado Correctamente");

                return

            };

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            })

            btnFavotiro.textContent = "Eliminar favorito";

            mostrarToast("Agregado Correctamente");
        }



        const btnCerrar = document.createElement("BUTTON");
        btnCerrar.classList.add("btn", "btn-secondary", "col");
        btnCerrar.textContent = "Cerrar";

        btnCerrar.onclick = function() {
            modal.hide();
        }

        modalFooter.appendChild(btnFavotiro);
        modalFooter.appendChild(btnCerrar);

        //    Muestra el modal
        modal.show();


    }


    function agregarFavorito(receta) {

        let favoritos = JSON.parse(localStorage.getItem('favoritos'));

        if (favoritos === null) {
            favoritos = [];
        }

        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]))
    }


    function eliminarFavorito(id) {
        let favoritos = JSON.parse(localStorage.getItem('favoritos'));
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));

    }


    function existeStorage(idMeal) {

        let favoritos = JSON.parse(localStorage.getItem('favoritos'));

        if (favoritos === null) {
            favoritos = [];
        }

        return favoritos.some(favorito => favorito.id === idMeal)

    }

    function mostrarToast(mensaje) {

        const toastDiv = document.querySelector("#toast");
        const toastBody = document.querySelector(".toast-body");
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;
        toast.show();
    }


    function obtenerFavoritos() {

        let favoritos = JSON.parse(localStorage.getItem('favoritos'));
        if (favoritos === null) {
            favoritos = [];
        }

        if (favoritos.length) {

            console.log(favoritos);

            mostrarRecetas(favoritos);

            return
        }

        const noFavoritos = document.createElement("P");
        noFavoritos.textContent = "No hay favoritos aún";
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        resultado.appendChild(noFavoritos);


    }


    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }


    }
}

document.addEventListener("DOMContentLoaded", iniciarApp);