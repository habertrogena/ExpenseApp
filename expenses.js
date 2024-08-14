document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transactionForm');
    const status = document.getElementById('status');
    const transactionList = document.getElementById('transactionList');
    const balanceEl = document.getElementById('balance');
    const incomeEl = document.getElementById('income');
    const expenseEl = document.getElementById('expense');
    const responseMsg = document.getElementById('response-msg');

    // function to fetch all the transactions
    const fetchTransactions = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/transactions');
            const data = await response.json();
            updateUI(data);
        } catch (err) {
            console.error('An error occurred:', err);
        }
    };
//function to format the date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const updateUI = (transactions) => {
        transactionList.innerHTML = '';
        let balance = 0;
        let income = 0;
        let expense = 0;

        transactions.forEach(transaction => {
            const { name, amount, date, type } = transaction;
            const formattedDate = formatDate(date);
            const transactionItem = document.createElement('li');
            transactionItem.textContent = `${name}: $${amount} on ${formattedDate}`;
            transactionList.appendChild(transactionItem);

            const amt = parseFloat(amount);
            if (type === 'income') {
                income += amt;
            } else {
                expense += amt;
            }
        });

        balance = income - expense;
        balanceEl.textContent = `$${balance.toFixed(2)}`;
        incomeEl.textContent = `$${income.toFixed(2)}`;
        expenseEl.textContent = `$${expense.toFixed(2)}`;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const type = document.getElementById('type').checked ? 'income' : 'expense';
        const name = document.getElementById('name').value;
        const amount = document.getElementById('amount').value;
        const date = document.getElementById('date').value;
        const responseMsg = document.getElementById('response-msg');

        try {
            const response = await fetch('http://localhost:3000/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type, name, amount, date })
            });
            
            const data = response.data;

            if (!response.ok) {
                
                responseMsg.textContent = 'Transaction not added  successfully';
                form.reset();
            } else {
                
                responseMsg.textContent = 'Transactions added sucessfully';
            }
        } catch (err) {
            
            responseMsg.textContent = 'An error occurred';
        }
    });
    fetchTransactions(); 
});