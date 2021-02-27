import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MoreInfo() {
  const [recipeInfoArray, setRecipeInfoArray] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const recipeInfoURL =
    "https://api.spoonacular.com/recipes/181272/information?includeNutrition=false&apiKey=28f4c1acf9cc4a96863ed9298ac43eb3";
  const nutritionVisualisationURL =
    "https://api.spoonacular.com/recipes/1082038/nutritionWidget?&defaultCss=true&apiKey=28f4c1acf9cc4a96863ed9298ac43eb3";

  let mounted = true;

  useEffect(() => {
    getRecipeInfo();
    getRecipeNutritionVisualised();
    return () => {
      mounted = false;
    };
  }, []);

  const getRecipeInfo = () => {
    axios
      .get(recipeInfoURL)
      .then((response) => {
        if (mounted) {
          let tempArr = [];
          tempArr = response.data;
          let tempArr2 = [];
          tempArr2.push(tempArr);
          setIsFetched(true);
          setRecipeInfoArray(tempArr2);
          console.log(tempArr2);
        }
      })
      .catch((error) => {
        setIsFetched(false);
        setErrorMsg(error);
      });
  };

  const getRecipeNutritionVisualised = () => {
    axios
      .get(nutritionVisualisationURL)
      .then((response) => {
        if (mounted) {
          setIsFetched(true);
          console.log(response.data);
        }
      })
      .catch((error) => {
        setIsFetched(false);
        setErrorMsg(error);
        console.log(error);
      });
  };

  // if there is an error
  if (errorMsg) {
    return (
      <div>
        <h3>An error has occured</h3>
      </div>
    ); // end of return.
  } else if (!isFetched) {
    return (
      <div>
        <h3>Loading please wait...</h3>
      </div>
    ); // end of return
  } else {
    // we have no errors and we have data
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            {recipeInfoArray.map((recipe) => (
              <div className="card" key={recipe.id}>
                <img
                  src={recipe.image}
                  alt="recipe"
                  style={{ width: "100%" }}
                />
                <br />
                <div className="container">
                  <h4>
                    <b>{recipe.title}</b>
                  </h4>
                  <p>Ready in: {" " + recipe.readyInMinutes + " "} minutes</p>
                  <p>Servings: {" " + recipe.servings}</p>
                  <hr />
                  <h4>Ingredients</h4>
                  {recipe.extendedIngredients.map((ingredients) => (
                    <li>{ingredients.original}</li>
                  ))}
                  <hr />
                  <h4>Instructions</h4>
                  <p>{recipe.instructions}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="col"></div>
        </div>
      </div>
    );
  }
}
