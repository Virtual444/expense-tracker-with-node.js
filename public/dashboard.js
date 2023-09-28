document.addEventListener("DOMContentLoaded", function() {

  const addExpenseButton = document.getElementById('addExpenseButton');
  const expenseTableBody = document.getElementById('expenseTableBody');
  const totalExpensesSpan = document.getElementById('totalExpenses');
  const categorySelect = document.getElementById("categorySelect");
  const categoryText = document.getElementById("categoryText");
  const logOut = document.getElementById('logOutLink');
  const token = localStorage.getItem('token');
  const decodeToken = parseJwt(token);
  const premiumMember = document.getElementById('razorPay');
  const leaderboardButton = document.getElementById('showLeaderBoard')
  let totalExpenses = 0;
  const downloadExpenseButton = document.getElementById("downloadExpenseButton");
  const downloadHistoryButton = document.getElementById("downloadHistoryButton");

//decode token in frontend
function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

if(decodeToken.premium) {
    const premiummessage = document.getElementById('premiumVersion');
          premiummessage.innerHTML = '(Premium Version)';

          const memebershipbutton = document.getElementById('razorPay');
          memebershipbutton.style.display = 'none';

          const leaderboardButton = document.getElementById('showLeaderBoard');
          leaderboardButton.style.display = 'block';

          
}

// reload with populate table
window.addEventListener('load', function() {
        populateTable();
});

//category select in expense form        
categorySelect.addEventListener("change", function() {
            
            categoryText.value = categorySelect.value; 
});
      
// add expense buttton
addExpenseButton.addEventListener("click", async function(event) {
        event.preventDefault();
    
        
        const name = document.getElementById('expenseName').value;
        const amountInput = document.getElementById('expenseAmount');
        const amount = parseFloat(amountInput.value);
        const category = document.getElementById('categoryText').value;
      
    const token = localStorage.getItem('token');

        
        if (name && !isNaN(amount) && category) {
          const data = {
            name: name,
            amount: amount,
            category:category
            
            
          };

          try {
            const response = await axios.post('http://localhost:3000/user/add-expense', data, {headers: {"Authorization" : token}})

            if(response.status === 201){
                document.getElementById('expenseName').value = '';
                amountInput.value = '';
                document.getElementById('categoryText').value = '';
                expenseTableBody.innerHTML = '';
                alert('Successfully added');
                const message = document.getElementById('message');
                message.innerHTML = '<h3>Successfully added</h3>'

                populateTable();

            }
            
          } catch (error) {
            console.log(error);
             }
    }else {
     alert('All fields are required.');

    }
});
      

// populate table      
function populateTable() {
      const token = localStorage.getItem('token');
     // console.log(token);
      axios.get('http://localhost:3000/allExpenses', {headers: {"Authorization" : token}} )
    
      .then(response => {
        //  console.log(response.data)
    
        if(response.data && response.data.expenses && Array.isArray(response.data.expenses)) {
    
          const expenses = response.data.expenses;
          expenses.forEach((expense, index) => {
          const newRow = createTableRow(expense, index + 1 );
          
          expenseTableBody.appendChild(newRow);
          // totalExpenses +=expense.amount;
          });
          totalExpenses = response.data.totalExpense;
          totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
       } 
       else {
     
        console.log('invalid response data structure');
    
      }
    
    })
      .catch(err => {
          console.log(err);
      });


}
    
// populate table with data
function createTableRow(expense, index) {

        const newRow = document.createElement('tr');
  
    newRow.setAttribute('data-entry-key', expense.id);
  
     const numberCell = document.createElement('td');
    numberCell.textContent = index;
    newRow.appendChild(numberCell);
  
    const nameCell = document.createElement('td');
    nameCell.textContent = expense.name;
    newRow.appendChild(nameCell);
  
    const amountCell = document.createElement('td');
  
    if (typeof expense.amount === 'number') {
      amountCell.textContent = `$${expense.amount.toFixed(2)}`;
    } else {
      amountCell.textContent = 'Invalid Amount';
    }
  
     newRow.appendChild(amountCell);
  
     const categoryCell = document.createElement('td');
    categoryCell.textContent = expense.category;
    newRow.appendChild(categoryCell);
  
  
  
     const manageCell = document.createElement('td');
     const editButton = document.createElement('button');
     editButton.textContent = 'Edit';
     editButton.addEventListener('click', function(event) {
      editExpense(expense.id, event);
        });
        
        manageCell.appendChild(editButton);
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
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
      axios.get(`http://localhost:3000/edit-Expense/${id}`)
      .then(response => {
        const expense = response.data.expense;
        console.log(expense);
        
        // Populate form fields with existing data
        document.getElementById('expenseName').value = expense.name;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('categoryText').value = expense.category;
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Changes';
        saveButton.type = 'button';
        saveButton.addEventListener('click', function() {
          saveChanges(id);
        });
    
        const addButton = document.querySelector('#expenseForm button[type="submit"]');
        addButton.parentNode.replaceChild(saveButton, addButton);
      })
      .catch(error => {
        console.error('Error fetching expense:', error);
      });
}

// edit expense  
function saveChanges(id) {
        const newName = document.getElementById('expenseName').value;
        const newAmountInput = document.getElementById('expenseAmount');
        const newAmount = parseFloat(newAmountInput.value);
        const newcategory = document.getElementById('categoryText').value;
        
  
  if (newName && !isNaN(newAmount) && newcategory) {
    const data = {
      name: newName,
      amount: newAmount,
      category: newcategory
    };
    console.log(data);
  
    axios.put(`http://localhost:3000/edit-expense/${id}`, data)
      .then(response => {
        console.log('Expense updated successfully:', response.data);
        document.getElementById('expenseName').value = '';
        newAmountInput.value = '';
        document.getElementById('categoryText').value = '';
        expenseTableBody.innerHTML = '';
        alert('Successfully Edited');
        const message = document.getElementById('message');
                message.innerHTML = '<h3>Successfully Edited</h3>'
        populateTable();
  
  
    })
      .catch(error => {
        console.error('Error updating expense:', error);
      });
  }
}
 
// delete expense  
function deleteExpense(id, expenseAmount) {
    console.log(id);
    axios.delete(`/delete-expense/${id}`) 
    .then(response => {
      console.log(response.data);
      
          totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
          expenseTableBody.innerHTML = '';
          alert('Successfully Deleted');
          const message = document.getElementById('message');
                message.innerHTML = '<h3>Successfully Deleted</h3>'
          populateTable();
          
    })
  
    .catch(error => {
      console.error('Error deleting expense:', error);
    });
}

// log out button

logOut.addEventListener("click", function (event) {
  event.preventDefault();

  localStorage.removeItem('token');
  window.location.href = '/login'; 

});

// purchase premium member button
premiumMember.addEventListener("click", async function (event) {
  event.preventDefault();

  const token = localStorage.getItem('token');
  try {
    const response = await axios.get('http://localhost:3000/purchase/premiumMembership', { headers: { "Authorization": token } });

    const options = {
      "key": response.data.key_id,
      "order_id": response.data.order.id,
      "handler": async function (response) {
        try {
         
          const result = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
            order_id: options.order_id,
            payment_id: response.razorpay_payment_id,
          }, { headers: { "Authorization": token } });

          alert('You are now a Premium User');
          location.reload();
          const newToken =  result.data.token;
          localStorage.setItem('token', newToken);

          const premiummessage = document.getElementById('premiumVersion');
          premiummessage.innerHTML = '(Premium Version)';

          const memebershipbutton = document.getElementById('razorPay');
          memebershipbutton.style.display = 'none';

        } catch (error) {

          console.error('Transaction update error:', error);
          alert('Transaction update failed');

        }
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    rzp1.on('payment.failed',  async function(response) {
      try {
        
        
         await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
          order_id: options.order_id,
          payment_id: null,
          
        }, { headers: { "Authorization": token } });
     
     
     
    }
      
     catch (error) {
      alert('Payment Failed, Please try again');
      location.reload();
      console.error(error);
    
      
    }
  })
   
    
  } catch (error) {
    console.error('Premium membership request error:', error);
    alert('Premium membership request failed');
  }
});


//premium leaderboard table and features

leaderboardButton.addEventListener( "click", async function(event) {
  event.preventDefault();
  const leaderboardTable = document.getElementById('Leaderboard-table-container');
          leaderboardTable.style.display = 'block';

 await leaderBoardTable();

});

async function leaderBoardTable() {
  try {
    const response = await axios.get('http://localhost:3000/show-leaderboard'); 
    const responseData = response.data;
    console.log(responseData);

    const tableBody = document.getElementById("leaderTableBody");

    
    tableBody.innerHTML = '';

    
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
    console.error('Error:', error);
  }
}


if (downloadExpenseButton) {
  downloadExpenseButton.addEventListener("click", async function (event) {
    event.preventDefault();

    try {
      
      const response = await axios.post('http://localhost:3000/expenses/download-expense', null,{headers: {Authorization : token}});
 
      if (response.status === 200 && response.data) {
        
        const blob = new Blob([response.data], { type: 'text/plain' });
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = 'expenses.txt';
        downloadLink.style.display = 'none'; 
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        console.error('Download failed or no file content received.');
      }
    } catch (error) {
      console.error('An error occurred while downloading expenses:', error);
    }
});





  
}

if (downloadHistoryButton) {
  downloadHistoryButton.addEventListener("click", async function (event) {
    event.preventDefault();

    try {
      const response = await axios.get('http://localhost:3000/expenses/download-expense-history', {headers: {Authorization : token}});
      
      
    } catch (error) { 
      console.error('An error occurred while fetching downloading expenses history:', error)
    }

  });
}



//domcontentloaded end
});








      
  