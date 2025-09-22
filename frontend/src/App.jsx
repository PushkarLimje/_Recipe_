import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedIngredients, setSearchedIngredients] = useState([]);
  const [page, setPage] = useState(1);
  const [lastAction, setLastAction] = useState("all");
  const [pageSize, setPageSize] = useState(10);

  const searchRecipes = async (actionType,  newPage = 1) => {
    setLoading(true);
    const ingredients = input
      .split(",")
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean);

    setSearchedIngredients(ingredients);
    setLoading(true);
    setLastAction(actionType);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredients, 
          action: actionType,  
          page: newPage, 
          pageSize: pageSize  }),
      });

      const data = await response.json();
      setRecipes(data);
      setPage(newPage);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Highlight searched ingredients inside text
  const highlightText = (text) => {
    if (!searchedIngredients.length) return text;

    let highlighted = text;
    searchedIngredients.forEach((ing) => {
      const regex = new RegExp(`(${ing})`, "gi");
      highlighted = highlighted.replace(
        regex,
        `<span class="bg-yellow-200 font-semibold">$1</span>`
      );
    });
    return highlighted;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          🍳 Recipe Finder
        </h1>

        {/* Input box */}
        <input
          type="text"
          placeholder="Enter ingredients (comma separated)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border border-gray-300 rounded-xl p-3 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => searchRecipes("all")}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-xl transition duration-200"
          >
            {loading ? "Searching..." : "Match All"}
          </button>
          <button
            onClick={() => searchRecipes("any")}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-xl transition duration-200"
          >
            {loading ? "Searching..." : "Match Any"}
          </button>
        </div>

        {/* Recipe count */}
        {recipes.length > 0 && (
          <p className="text-sm text-gray-700 mb-2">
            ✅ {recipes.length} recipe{recipes.length > 1 ? "s" : ""} found
          </p>
        )}

        {/* Results */}
        <div className="mt-2 p-4 border border-gray-200 rounded-xl bg-gray-50 h-64 overflow-y-auto">
          {recipes.length > 0 ? (
            <ul className="space-y-3">
              {recipes.map((r, idx) => (
                <li
                  key={idx}
                  className="bg-white shadow-sm p-3 rounded-lg border border-gray-200 hover:shadow-md transition"
                >
                  <h2 className="text-lg font-semibold text-indigo-700">
                    {r.name}
                  </h2>
                  <p className="text-sm text-gray-600">{r.description}</p>
                  <p
                    className="text-xs text-gray-500 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: `<b>Ingredients:</b> ${highlightText(
                        r.recipeIngredientParts
                      )}`,
                    }}
                  />
                  <p
                    className="text-xs text-gray-500 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: `<b>Instructions:</b> ${highlightText(
                        r.recipeInstructions
                      )}`,
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">
              No recipes found. Try different ingredients.
            </p>
          )}
        </div>

        {/* Pagination controls */}

          {recipes.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={page === 1}
                onClick={() => searchRecipes("all", page - 1)}  // or "any" depending on button pressed
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
              >
                Prev
              </button>
              <span className="text-gray-600">Page {page}</span>
              <button
                onClick={() => searchRecipes("all", page + 1)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}
          {/* Page size buttons */}
              <div className="flex justify-center mt-2 gap-2">
                {[5, 10, 20, 50].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setPageSize(size);
                      searchRecipes(lastAction, 1); // reset to page 1
                    }}
                    className={`px-3 py-1 rounded border transition 
                      ${pageSize === size 
                        ? "bg-indigo-500 text-white border-indigo-600" 
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>


      </div>
    </div>
    
  );
}

export default App;
