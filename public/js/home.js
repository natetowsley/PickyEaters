document.querySelector("#detailsBtn").addEventListener("click", show);
document.querySelector("#submitBtn").addEventListener("click", getNextRecipe);


getNextRecipe();


async function show() {
    var myModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    myModal.show();
}

async function getNextRecipe() {
    // let url = "https://api.spoonacular.com/recipes/random?number=1&apiKey=d6dff3ba15ec4b89a868a2315bf77b37&includeNutrition=true";
    // let response = await fetch(url);
    // let data = await response.json();

    // BELOW IS DUMMY DATA TO BE USED WHEN NOT TESTING API (Avoid api hits cap)
    let data = {
        recipes : [
            {
                "id" : 1000,
                "title" : "Krabby Patty",
                "image" : "/img/patty.jpg",
                "summary" : "The secret formula is unknown, but the whole thing is very soggy."
            }

        ]
    }
    console.log(data);

    document.querySelector('.card-header').textContent = data.recipes[0].title;
    document.querySelector('input[name="recipeId"]').value = data.recipes[0].id; // Fixed!
    document.querySelector('input[name="title"]').value = data.recipes[0].title;
    document.querySelector('input[name="image"]').value = data.recipes[0].image;
    document.querySelector('input[name="summary"]').value = data.recipes[0].summary;
    document.querySelector('#foodImg').src = data.recipes[0].image;
    document.querySelector('#foodModalLabel').textContent = data.recipes[0].title;
    if (data.recipes[0].summary != "") {
        document.querySelector('#foodSummary').textContent = data.recipes[0].summary;
    }
    else {
        document.querySelector('#foodSummary').textContent = "No summary for this food";
    }
}