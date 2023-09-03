document.addEventListener("DOMContentLoaded", function() {
//
const addExpenseButton = document.getElementById('addExpenseButton');
const expenseTableBody = document.getElementById('expenseTableBody');
const totalExpensesSpan = document.getElementById('totalExpenses');
let totalExpenses = 0;



    window.addEventListener('load', function() {
        populateTable();
      });
    
      const categorySelect = document.getElementById("categorySelect");
        const categoryText = document.getElementById("categoryText");
    
        
        categorySelect.addEventListener("change", function() {
            
            categoryText.value = categorySelect.value; 
        });
        
        //
        

//

function calculateTotalExpenses(expenses) {
        let total = 0;
        expenses.forEach(expense => {
          total += expense.amount;
        });
        return total;
      }
  
//

    
    
    
    
//

      addExpenseButton.addEventListener("click", async function(event) {
        event.preventDefault();
    
        
        const name = document.getElementById('expenseName').value;
        const amountInput = document.getElementById('expenseAmount');
        const amount = parseFloat(amountInput.value);
        const category = document.getElementById('categoryText').value;
       // const entryKey = `entry_${Date.now()}`;
    //    console.log(category);

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
                const message = document.getElementById('message');
                message.innerHTML = '<h3>Successfully added</h3>'

                populateTable();

            }
            
          } catch (error) {
            console.log(error);
             }
    }else {
      const message = document.getElementById('message');
                message.innerHTML = '<h3>All fields are required</h3>'

    }
      });
      
      

      //
      
    function populateTable() {
      const token = localStorage.getItem('token');
     // console.log(token);
      axios.get('http://localhost:3000/allExpenses', {headers: {"Authorization" : token}} )
    
      .then(response => {
         console.log(response.data)
    
        if(response.data && response.data.expenses && Array.isArray(response.data.expenses)) {
    
          const expenses = response.data.expenses;
          expenses.forEach((expense, index) => {
          const newRow = createTableRow(expense, index + 1 );
          
          expenseTableBody.appendChild(newRow);
          // totalExpenses +=expense.amount;
          });
          totalExpenses = calculateTotalExpenses(expenses);
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
    

    //

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

//    

  
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

  //
  
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
        populateTable();
  
  
    })
      .catch(error => {
        console.error('Error updating expense:', error);
      });
  }
  }

  //
  
  
  
  function deleteExpense(id, expenseAmount) {
    console.log(id);
    axios.delete(`/delete-expense/${id}`) 
    .then(response => {
      console.log(response.data);
      totalExpenses -= expenseAmount;
          totalExpensesSpan.textContent = `$${totalExpenses.toFixed(2)}`;
          expenseTableBody.innerHTML = '';
          populateTable();
          
    })
  
    .catch(error => {
      console.error('Error deleting expense:', error);
    });
   }


const logOut = document.getElementById('logOutLink');

logOut.addEventListener("click", function (event) {
  event.preventDefault();

  localStorage.removeItem('token');
  window.location.href = '/login'; 

})

});



      
  