document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transactionForm');
    const status = document.getElementById('status');

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
});