// NOTE: used transactionsObjectStore for the saved object store to differentiate between that and transaction.objectStore('new_transaction') method.
let db;

//open connection and set to db verion 1
const request = indexedDB.open('budget_tracker', 1);

//add the object store
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', {autoIncrement: true});
};

//on successful entry
request.onsuccess = function(event) {
    db = event.target.result;
    //is app online?
    if(navigator.onLine) {
        uploadTransaction();

    }
};

// if error
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

//upload a new transaction if not internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionsObjectStore = transaction.objectStore('new_transaction');
    transactionsObjectStore.add(record);
};

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionsObjectStore = transaction.objectStore('new_transaction');
    const getAll = transactionsObjectStore.getAll();
    
    getAll.onsuccess = function(){
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
//                 //open one more transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite' );
//                 //access new transaction object store
                const transactionsObjectStore = transaction.objectStore('new_transaction');
//                 //clear store
                transactionsObjectStore.clear();

                alert('All transactions have been uploaded');
            })
            .catch(err => {
                console.log(err);
            });
        }
    }
};
//listen for the app coming back online
window.addEventListener('online', uploadTransaction);