// Firebase SDK Imports - Modular v10
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    updateDoc, 
    doc, 
    query, 
    orderBy,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Your web app's Firebase configuration - REAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBiaeJBs5cOwpE-q4OJUJpRdQ05hDpLSBc",
  authDomain: "mini-crm-task2.firebaseapp.com",
  projectId: "mini-crm-task2",
  storageBucket: "mini-crm-task2.firebasestorage.app",
  messagingSenderId: "1044718474291",
  appId: "1:1044718474291:web:0504c5ce3d2ba59d59f08c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements - MATCHING YOUR HTML IDs
const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const addLeadBtn = document.getElementById('add-lead-btn');
const leadsTableBody = document.getElementById('leads-body');
const totalLeadsEl = document.getElementById('total-leads');
const newLeadsEl = document.getElementById('new-leads');
const contactedLeadsEl = document.getElementById('contacted-leads');
const convertedLeadsEl = document.getElementById('converted-leads');

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginContainer.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loadLeads();
    } else {
        loginContainer.classList.remove('hidden');
        dashboard.classList.add('hidden');
    }
});

// Login Function - Using Button Click
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert('Login Failed: ' + error.message);
    }
});

// Logout Function
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout Error:', error);
    }
});

// Add New Lead - Using Button Click
addLeadBtn.addEventListener('click', async () => {
    const name = document.getElementById('lead-name').value;
    const email = document.getElementById('lead-email').value;
    const source = document.getElementById('lead-source').value;
    
    if (!name || !email) {
        alert('Please enter Name and Email');
        return;
    }
    
    const leadData = {
        name: name,
        email: email,
        source: source,
        status: 'New',
        notes: '',
        createdAt: serverTimestamp()
    };
    
    try {
        await addDoc(collection(db, 'leads'), leadData);
        // Clear inputs
        document.getElementById('lead-name').value = '';
        document.getElementById('lead-email').value = '';
        document.getElementById('lead-source').value = '';
    } catch (error) {
        alert('Error adding lead: ' + error.message);
    }
});

// Load & Display Leads - Real Time Updates
function loadLeads() {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (snapshot) => {
        leadsTableBody.innerHTML = '';
        let total = 0, newCount = 0, contacted = 0, converted = 0;
        
        snapshot.forEach((doc) => {
            const lead = doc.data();
            const leadId = doc.id;
            total++;
            
            if (lead.status === 'New') newCount++;
            if (lead.status === 'Contacted') contacted++;
            if (lead.status === 'Converted') converted++;
            
            const dateAdded = lead.createdAt ? lead.createdAt.toDate().toLocaleDateString() : 'Just now';
            
            const row = `
                <tr>
                    <td>${lead.name}</td>
                    <td>${lead.email}</td>
                    <td>${lead.source || '-'}</td>
                    <td>
                        <select onchange="updateStatus('${leadId}', this.value)">
                            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
                            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                            <option value="Converted" ${lead.status === 'Converted' ? 'selected' : ''}>Converted</option>
                            <option value="Lost" ${lead.status === 'Lost' ? 'selected' : ''}>Lost</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" value="${lead.notes || ''}" 
                               onchange="updateNotes('${leadId}', this.value)" 
                               placeholder="Add notes...">
                    </td>
                    <td>${dateAdded}</td>
                </tr>
            `;
            leadsTableBody.innerHTML += row;
        });
        
        // Update Stats
        totalLeadsEl.textContent = total;
        newLeadsEl.textContent = newCount;
        contactedLeadsEl.textContent = contacted;
        convertedLeadsEl.textContent = converted;
    });
}

// Update Status Function - Global scope
window.updateStatus = async (id, newStatus) => {
    try {
        await updateDoc(doc(db, 'leads', id), {
            status: newStatus
        });
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
};

// Update Notes Function - Global scope
window.updateNotes = async (id, newNotes) => {
    try {
        await updateDoc(doc(db, 'leads', id), {
            notes: newNotes
        });
    } catch (error) {
        alert('Error updating notes: ' + error.message);
    }
};
