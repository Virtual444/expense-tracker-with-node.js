document.addEventListener("DOMContentLoaded", function () {
  const addExpenseButton = document.getElementById("addExpenseButton");
  const expenseTableBody = document.getElementById("expenseTableBody");
  const totalExpensesSpan = document.getElementById("totalExpenses");
  const categorySelect = document.getElementById("categorySelect");
  const categoryText = document.getElementById("categoryText");
  const logOut = document.getElementById("logOutLink");
  const token = localStorage.getItem("token");
  const decodeToken = parseJwt(token);
  const premiumMember = document.getElementById("razorPay");
  let totalExpenses = 0;
  const downloadExpense = document.getElementById("downloadExpense");
  const downloadHistoryButton = document.getElementById("showDownloadHistory");

  localStorage.setItem("expensePerPage", "10");
  let currentPage = 1;

  //decode token in frontend
  function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  if (decodeToken.premium) {
    const premiummessage = document.getElementById("premiumVersion");
    premiummessage.innerHTML = "(PREMIUM)";

    const memebershipbutton = document.getElementById("razorPay");
    memebershipbutton.style.display = "none";

    const leaderboardTable = document.getElementById(
      "Leaderboard-table-container"
    );
    leaderboardTable.style.display = "block";

    const downloadExpensebutton = document.getElementById("downloadExpense");
    downloadExpensebutton.style.display = "block";

    downloadHistoryButton.style.display = "block";

    leaderBoardTable();
  }

  // reload with populate table
  window.addEventListener("load", function () {
    populateTable(currentPage);
  });

  //category select in expense form
  categorySelect.addEventListener("change", function () {
    categoryText.value = categorySelect.value;
  });

  // add expense buttton
  addExpenseButton.addEventListener("click", async function (event) {
    event.preventDefault();

    const name = document.getElementById("expenseName").value;
    const amountInput = document.getElementById("expenseAmount");
    const amount = parseFloat(amountInput.value);
    const category = document.getElementById("categoryText").value;

    const token = localStorage.getItem("token");

    if (name && !isNaN(amount) && category) {
      const data = {
        name: name,
        amount: amount,
        category: category,
      };

      try {
        const response = await axios.post(
          "/user/add-expense",
          data,
          { headers: { Authorization: token } }
        );

        if (response.status === 201) {
          document.getElementById("expenseName").value = "";
          amountInput.value = "";
          document.getElementById("categoryText").value = "";
          expenseTableBody.innerHTML = "";
          alert("Successfully added");
          const message = document.getElementById("message");
          message.innerHTML = "<h3>Successfully added...</h3>";

          populateTable(currentPage);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("All fields are required.");
    }
  });

  //pagination

  const nextPageButton = document.getElementById("nextPageButton");
  nextPageButton.addEventListener("click", () => {
    currentPage++;
    expenseTableBody.innerHTML = "";
    populateTable(currentPage);
  });

  const prevPageButton = document.getElementById("prevPageButton");
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      expenseTableBody.innerHTML = "";
      populateTable(currentPage);
    }
  });

  // range for expense in page

  const rangeSelect = document.getElementById("rangeSelect");
  rangeSelect.addEventListener("change", () => {
    const selectedValue = parseInt(rangeSelect.value);
    localStorage.setItem("expensePerPage", selectedValue);
    expenseTableBody.innerHTML = "";
    populateTable(currentPage);
  });

  // populate table
  function populateTable(page) {
    const token = localStorage.getItem("token");
    const itemsPerPage = localStorage.getItem("expensePerPage");

    let startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    axios
      .get("/allExpenses", {
        headers: { Authorization: token },
        params: { page: page, itemsPerPage: itemsPerPage },
      })
      

      .then((response) => {
       
        if (
          response.data &&
          response.data.expenses &&
          Array.isArray(response.data.expenses)
        ) {
          const expenses = response.data.expenses;

          prevPageButton.disabled = page === 1 ? true : false;
          nextPageButton.disabled =
            expenses.length < itemsPerPage ? true : false;

          let startIndex = (page - 1) * itemsPerPage + 1;

          const endIndex = startIndex + itemsPerPage;

          expenses.forEach((expense, index) => {
            const newRow = createTableRow(expense, index + startIndex);

            expenseTableBody.appendChild(newRow);
          });
          totalExpenses = response.data.totalExpense;
          totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
        } else {
          console.log("invalid response data structure");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // populate table with data
  function createTableRow(expense, index) {
    const newRow = document.createElement("tr");

    newRow.setAttribute("data-entry-key", expense.id);

    const numberCell = document.createElement("td");
    numberCell.textContent = index;
    newRow.appendChild(numberCell);

    const nameCell = document.createElement("td");
    nameCell.textContent = expense.name;
    newRow.appendChild(nameCell);

    const amountCell = document.createElement("td");

    if (typeof expense.amount === "number") {
      amountCell.textContent = `$${expense.amount.toFixed(2)}`;
    } else {
      amountCell.textContent = "Invalid Amount";
    }

    newRow.appendChild(amountCell);

    const categoryCell = document.createElement("td");
    categoryCell.textContent = expense.category;
    newRow.appendChild(categoryCell);

    const manageCell = document.createElement("td");
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", function (event) {
      editExpense(expense.id, event);
    });

    manageCell.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", function () {
      deleteExpense(expense.id, expense.amount);
      console.log(expense.id);
    });
    manageCell.appendChild(deleteButton);

    newRow.appendChild(manageCell);

    return newRow;
  }

  // edit expense
  function editExpense(id, event) {
    event.preventDefault();
    axios
      .get(`/edit-Expense/${id}`)
      .then((response) => {
        const expense = response.data.expense;

        // Populate form fields with existing data
        document.getElementById("expenseName").value = expense.name;
        document.getElementById("expenseAmount").value = expense.amount;
        document.getElementById("categoryText").value = expense.category;

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Changes";
        saveButton.type = "button";
        saveButton.addEventListener("click", function () {
          saveChanges(id);
        });

        const addButton = document.querySelector(
          '#expenseForm button[type="submit"]'
        );
        addButton.parentNode.replaceChild(saveButton, addButton);
      })
      .catch((error) => {
        console.error("Error fetching expense:", error);
      });
  }

  // edit expense
  function saveChanges(id) {
    const newName = document.getElementById("expenseName").value;
    const newAmountInput = document.getElementById("expenseAmount");
    const newAmount = parseFloat(newAmountInput.value);
    const newcategory = document.getElementById("categoryText").value;

    if (newName && !isNaN(newAmount) && newcategory) {
      const data = {
        name: newName,
        amount: newAmount,
        category: newcategory,
      };

      axios
        .put(`/edit-expense/${id}`, data)
        .then((response) => {
          console.log("Expense updated successfully:", response.data);
          document.getElementById("expenseName").value = "";
          newAmountInput.value = "";
          document.getElementById("categoryText").value = "";
          expenseTableBody.innerHTML = "";
          alert("Successfully Edited");
          const message = document.getElementById("message");
          message.innerHTML = "<h3>Successfully Edited...</h3>";
          populateTable(currentPage);
        })
        .catch((error) => {
          console.error("Error updating expense:", error);
        });
    }
  }

  // delete expense
  function deleteExpense(id, expenseAmount) {
    axios
      .delete(`/delete-expense/${id}`)
      .then((response) => {
        totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
        expenseTableBody.innerHTML = "";
        alert("Successfully Deleted");
        const message = document.getElementById("message");
        message.innerHTML = "<h3>Successfully Deleted</h3>";
        populateTable(currentPage);
      })

      .catch((error) => {
        console.error("Error deleting expense:", error);
      });
  }

  // log out button

  logOut.addEventListener("click", function (event) {
    event.preventDefault();

    localStorage.removeItem("token");
    window.location.href = "/login";
  });

  // purchase premium member button
  premiumMember.addEventListener("click", async function (event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "/purchase/premiumMembership",
        { headers: { Authorization: token } }
      );

      const options = {
        key: response.data.key_id,
        order_id: response.data.order.id,
        handler: async function (response) {
          try {
            const result = await axios.post(
              "/purchase/updatetransactionstatus",
              {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
              },
              { headers: { Authorization: token } }
            );

            alert("You are now a Premium User");
            location.reload();
            const newToken = result.data.token;
            localStorage.setItem("token", newToken);

            const premiummessage = document.getElementById("premiumVersion");
            premiummessage.innerHTML = "(Premium Version)";

            const memebershipbutton = document.getElementById("razorPay");
            memebershipbutton.style.display = "none";
          } catch (error) {
            console.error("Transaction update error:", error);
            alert("Transaction update failed");
          }
        },
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
      rzp1.on("payment.failed", async function (response) {
        try {
          await axios.post(
            "/purchase/updatetransactionstatus",
            {
              order_id: options.order_id,
              payment_id: null,
            },
            { headers: { Authorization: token } }
          );
        } catch (error) {
          alert("Payment Failed, Please try again");
          location.reload();
          console.error(error);
        }
      });
    } catch (error) {
      console.error("Premium membership request error:", error);
      alert("Premium membership request failed");
    }
  });

  //premium leaderboard table and features

  async function leaderBoardTable() {
    try {
      const response = await axios.get(
        "/show-leaderboard"
      );
      const responseData = response.data;

      const tableBody = document.getElementById("leaderTableBody");

      tableBody.innerHTML = "";

      responseData.forEach((user, index) => {
        const row = tableBody.insertRow();
        const numberCell = row.insertCell(0);
        const nameCell = row.insertCell(1);
        const totalExpensesCell = row.insertCell(2);

        numberCell.textContent = index + 1;
        nameCell.textContent = user.name;
        totalExpensesCell.textContent = user.totalExpenses;
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  downloadExpense.addEventListener("click", async function (event) {
    event.preventDefault();

    try {
      const response = await axios.post(
        "/expenses/download-expense",
        null,
        { headers: { Authorization: token } }
      );

      if (response.status === 200 && response.data) {
        const blob = new Blob([response.data], { type: "text/plain" });
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = "expenses.txt";
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        console.error("Download failed or no file content received.");
      }
    } catch (error) {
      console.error("An error occurred while downloading expenses:", error);
    }
  });

  downloadHistoryButton.addEventListener("click", async function (event) {
    event.preventDefault();
    if (decodeToken.premium) {
      
            try {
        const response = await axios.get(
          "/expenses/download-expense-history",
          { headers: { Authorization: token } }
        );
         
        if (
          response.data &&
          response.data.downloadHistory &&
          Array.isArray(response.data.downloadHistory)) {
          const downloadHistory = response.data.downloadHistory;
          const tableBody = document.getElementById("leaderTableBody");

             tableBody.innerHTML = "";

          downloadHistory.forEach((history, index) => {
            const row = tableBody.insertRow();
        const numberCell = row.insertCell(0);
        const urlCell = row.insertCell(1);
        const downloadDateCell = row.insertCell(2);

        numberCell.textContent = index + 1;
        urlCell.textContent = history.downloadedFileUrl;
        downloadDateCell.textContent = history.downloadedAt;
          });


          }else {
           
              console.log("invalid response data structure");
            
          }
      } catch (error) {
        console.error(
          "An error occurred while fetching downloading expenses history:",
          error
        );
      }
    }else {
      alert('You are not pro user')
    }
    });
  
    
    
  //domcontentloaded end
});
