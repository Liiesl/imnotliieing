// manhwa-tracker.js
import { db } from '../firebase.js';
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const manhwaForm = document.getElementById('manhwaForm');
const progressDiv = document.getElementById('progress');

// Save Manhwa Progress
manhwaForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const manhwaUrl = document.getElementById('manhwaUrl').value;
  const lastChapter = document.getElementById('lastChapter').value;

  try {
    // Add a new document to the "manhwaProgress" collection
    const docRef = await addDoc(collection(db, "manhwaProgress"), {
      manhwaUrl,
      lastChapter: parseInt(lastChapter),
      lastReadDate: new Date().toISOString(),
    });

    console.log("Document written with ID: ", docRef.id);
    alert('Progress saved!');
    loadProgress();
  } catch (error) {
    console.error("Error adding document: ", error);
    alert('Error saving progress.');
  }
});

// Load Manhwa Progress
async function loadProgress() {
  progressDiv.innerHTML = ''; // Clear previous content

  try {
    const querySnapshot = await getDocs(collection(db, "manhwaProgress"));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      progressDiv.innerHTML += `
        <div class="manhwa-entry">
          <p><strong>Manhwa URL:</strong> ${data.manhwaUrl}</p>
          <p><strong>Last Chapter Read:</strong> ${data.lastChapter}</p>
          <p><strong>Last Read Date:</strong> ${data.lastReadDate}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading progress: ", error);
  }
}

// Load progress on page load
loadProgress();