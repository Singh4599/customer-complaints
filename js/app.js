// app.js — LV Spices Customer Complaint Register
// Auto-generates complaints every 40-50 days from April 2026

import { saveComplaint, loadAllComplaints, updateCloudBadge } from './firebase-config.js';

const PRODUCTS = [
  "Red Chilli Powder", "Turmeric Powder", "Coriander Powder", "Garam Masala",
  "Cumin Powder", "Peri Peri Seasoning", "Pizza Seasoning", "Chaat Masala",
  "Oregano Seasoning", "Biryani Masala", "Chilli Flakes", "Mixed Herbs",
  "Schezwan Seasoning", "Pav Bhaji Masala", "Kashmiri Chilli Powder"
];

const CUSTOMERS = [
  ["Ramesh Kumar",    "9876543210"], ["Sunita Sharma",   "9812345678"],
  ["Amit Patel",      "9823456789"], ["Neha Verma",      "9876501234"],
  ["Vikram Singh",    "9898765432"], ["Pooja Mehta",     "9811122233"],
  ["Sanjay Gupta",    "9877712345"], ["Kavita Joshi",    "9899001122"],
  ["Manish Agarwal",  "9822003344"], ["Priya Nair",      "9876654321"],
  ["Dinesh Rao",      "9845123456"], ["Meera Pillai",    "9900112233"],
  ["Suresh Tiwari",   "9812009876"], ["Anita Desai",     "9867453210"]
];

const COMPLAINT_TYPES = [
  {
    complaint: "Hole found in packet.",
    action: "Damaged packet replaced with new packet. Packing line checked.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Pin-hole defect in pouch film / sharp guide rail on packing conveyor.",
    preventive: "Conveyor guide rails polished and pouch film tension calibrated."
  },
  {
    complaint: "Packet seal open.",
    action: "Packet replaced. Sealing machine checked and adjusted.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Temperature fluctuation on horizontal sealing jaws of Sealing Machine SM-01.",
    preventive: "PID temperature controller recalibrated; hourly seal integrity vacuum check instituted."
  },
  {
    complaint: "Short weight (less quantity).",
    action: "Weight verified. Shortage quantity supplied to customer. Weighing scale rechecked.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Tare weight offset drift on digital platform scale WS-01.",
    preventive: "Mandatory standard weight calibration verified before each packing shift."
  },
  {
    complaint: "Colour variation (darker than usual).",
    action: "Quality checked. Found within acceptable range. Customer informed.",
    status: "Closed", remarks: "Customer satisfied.",
    rootCause: "Natural seasonal crop variation in raw spice lot; moisture and curcumin within FSSAI spec.",
    preventive: "Batch retention certificate of analysis (CoA) shared with retailer."
  },
  {
    complaint: "Damaged packaging.",
    action: "Damaged packet replaced. Packing material quality checked.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Stacking pressure during transit in logistics carrier master carton.",
    preventive: "Upgraded 5-ply master carton bursting strength to 14 kg/cm²."
  },
  {
    complaint: "Wrong product supplied.",
    action: "Correct product delivered to customer. Dispatch process reviewed.",
    status: "Closed", remarks: "Customer satisfied.",
    rootCause: "Barcode scanner misread at secondary sorting table during peak order volume.",
    preventive: "Two-step pick-and-pack verification scan implemented in dispatch SOP."
  },
  {
    complaint: "Incorrect label (product name not clear).",
    action: "Label reprinted and product replaced. Label checking process improved.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Thermal transfer printer ribbon faint printing at end of roll.",
    preventive: "Automatic ribbon end sensor enabled on printer; pre-print test sheet required."
  },
  {
    complaint: "Lumps found in powder.",
    action: "Product replaced. Moisture control checked in storage.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Pouch stored in ambient humidity area during rainy season.",
    preventive: "Pallet wrap moisture-barrier stretch film mandated across all finished goods."
  },
  {
    complaint: "Unusual smell.",
    action: "Affected batch kept on hold. Quality checked. Fresh stock supplied to customer.",
    status: "Closed", remarks: "Customer satisfied.",
    rootCause: "Lab analysis of retention sample showed normal profile; slight essential oil pungency shift.",
    preventive: "Batch retention test report verified and shared with customer."
  },
  {
    complaint: "Foreign particles found.",
    action: "Batch isolated for investigation. New packet supplied. Process and cleaning reviewed.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Isolated natural spice husk fiber; sifter screen integrity verified intact.",
    preventive: "Vibratory sifter 40-mesh inspection frequency increased to 2-hour intervals."
  },
  {
    complaint: "Expiry date not printed clearly.",
    action: "Label format corrected. New stock issued.",
    status: "Closed", remarks: "No further complaint.",
    rootCause: "Inkjet printhead nozzle partially dry after weekend line stoppage.",
    preventive: "Daily printhead solvent purge routine added to morning startup SOP."
  },
  {
    complaint: "Product stale/hardened.",
    action: "Stock checked. Storage conditions reviewed. Fresh batch issued.",
    status: "Closed", remarks: "Customer satisfied.",
    rootCause: "Retail storage near window with prolonged direct sunlight exposure.",
    preventive: "Prominent 'Store in Cool, Dry Place Away from Sunlight' advisory added on shipper box."
  }
];

function seedRng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

const PRODUCT_INITIALS = {
  "Chilli Flakes": "CF",
  "Chaat Masala": "CM",
  "Kashmiri Chilli Powder": "KC",
  "Turmeric Powder": "TP",
  "Oregano Seasoning": "OS",
  "Red Chilli Powder": "RC",
  "Coriander Powder": "CP",
  "Garam Masala": "GM",
  "Cumin Powder": "CU",
  "Peri Peri Seasoning": "PP",
  "Pizza Seasoning": "PS",
  "Biryani Masala": "BM",
  "Mixed Herbs": "MH",
  "Schezwan Seasoning": "SS",
  "Pav Bhaji Masala": "PB"
};

function getProductInitials(productName) {
  if (PRODUCT_INITIALS[productName]) return PRODUCT_INITIALS[productName];
  const words = productName.split(' ').filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return productName.slice(0, 2).toUpperCase();
}

function formatBatchNumber(productName, dateObj) {
  const inits = getProductInitials(productName);
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yy = String(dateObj.getFullYear()).slice(-2);
  return `Batch No. ${inits}-${mm}${yy}`;
}

function formatDate(d) { return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
function padDate(d) { return d.toISOString().split('T')[0]; }

function generateComplaints() {
  const complaints = [];
  const start = new Date('2026-04-01');
  const today = new Date();
  let d = new Date(start);
  let idx = 1;

  while (d <= today) {
    const rng = seedRng(d.getTime() + idx);
    const cust = CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
    const prod = PRODUCTS[Math.floor(rng() * PRODUCTS.length)];
    const batchNo = formatBatchNumber(prod, d);
    const complaintType = COMPLAINT_TYPES[Math.floor(rng() * COMPLAINT_TYPES.length)];
    const dateStr = padDate(d);
    const closingDays = 1 + Math.floor(rng() * 2);
    const closingD = new Date(d); closingD.setDate(closingD.getDate() + closingDays);

    complaints.push({
      id: `CC-${String(idx).padStart(4,'0')}`,
      srNo: idx,
      date: dateStr,
      displayDate: formatDate(d),
      customerName: cust[0],
      contactNo: cust[1],
      productName: prod,
      batchNo: batchNo,
      complaint: complaintType.complaint,
      actionTaken: complaintType.action,
      rootCause: complaintType.rootCause,
      preventive: complaintType.preventive,
      closingDate: formatDate(closingD),
      turnaround: `${closingDays * 24} Hours`,
      status: complaintType.status,
      remarks: complaintType.remarks,
      isGenerated: true
    });

    // Next complaint 40–50 days later
    const gap = 40 + Math.floor(rng() * 11);
    d.setDate(d.getDate() + gap);
    idx++;
  }
  return complaints;
}

// ── STATE ──────────────────────────────────────────────────────────────────
let allComplaints = [];
let filteredComplaints = [];
let currentComplaintId = null;

// ── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  const cloudData = await loadAllComplaints();
  const cloudMap = {};
  cloudData.forEach(c => { cloudMap[c.id] = c; });

  const generated = generateComplaints();
  generated.forEach(c => {
    if (!cloudMap[c.id]) cloudMap[c.id] = c;
    else cloudMap[c.id] = { ...c, ...cloudMap[c.id] };
  });

  allComplaints = Object.values(cloudMap).sort((a, b) => b.date.localeCompare(a.date));
  filteredComplaints = [...allComplaints];

  renderStats();
  renderSidebarList();
  renderTable();
  if (allComplaints.length > 0) openComplaint(allComplaints[0].id);
}

function renderStats() {
  const total = allComplaints.length;
  const closed = allComplaints.filter(c => c.status === 'Closed').length;
  const open = allComplaints.filter(c => c.status === 'Open').length;
  const pending = allComplaints.filter(c => c.status === 'Pending').length;

  const t1 = document.getElementById('stat-total');
  const t2 = document.getElementById('stat-total-bar');
  const c1 = document.getElementById('stat-closed');
  const c2 = document.getElementById('stat-closed-bar');
  const o1 = document.getElementById('stat-open');
  const p1 = document.getElementById('stat-pending');

  if (t1) t1.textContent = total;
  if (t2) t2.textContent = total;
  if (c1) c1.textContent = closed;
  if (c2) c2.textContent = closed;
  if (o1) o1.textContent = open;
  if (p1) p1.textContent = pending;
}

function renderSidebarList() {
  const container = document.getElementById('complaint-list');
  if (!container) return;
  if (filteredComplaints.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.4);font-size:11px;">No records found</div>`;
    return;
  }
  container.innerHTML = filteredComplaints.map(c => `
    <div class="complaint-card ${c.id === currentComplaintId ? 'active' : ''}" onclick="openComplaint('${c.id}')">
      <div class="complaint-card-header">
        <span class="complaint-card-id">${c.id}</span>
        <span class="complaint-card-date">${c.displayDate}</span>
      </div>
      <div class="complaint-card-prod">${c.productName}</div>
      <div class="complaint-card-footer">
        <span class="complaint-card-cust">${c.customerName}</span>
        <span class="complaint-card-pill">${c.status}</span>
      </div>
    </div>
  `).join('');
}

function renderTable() {
  const tbody = document.getElementById('complaint-tbody');
  if (!tbody) return;
  tbody.innerHTML = filteredComplaints.map(c => `
    <tr class="${c.id === currentComplaintId ? 'row-active' : ''}" onclick="openComplaint('${c.id}')">
      <td class="col-sr">${c.srNo}</td>
      <td class="col-date">${c.displayDate}</td>
      <td class="col-ticket">${c.id}</td>
      <td class="col-cust">
        <div class="cust-name">${c.customerName}</div>
        <div class="cust-phone">${c.contactNo}</div>
      </td>
      <td class="col-prod">
        <div class="prod-badge">${c.productName}</div>
        <div class="batch-sub">${c.batchNo}</div>
      </td>
      <td class="col-complaint">${c.complaint}</td>
      <td class="col-action">${c.actionTaken}</td>
      <td class="col-closing">${c.closingDate}</td>
      <td class="col-status">
        <span class="status-pill ${c.status === 'Closed' ? 'pill-closed' : c.status === 'Pending' ? 'pill-pending' : 'pill-open'}">${c.status.toUpperCase()}</span>
      </td>
      <td class="col-remarks">${c.remarks}</td>
      <td class="col-edit" onclick="event.stopPropagation()">
        <button class="btn-edit-row" onclick="openEditModal('${c.id}')" title="Edit">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
      </td>
    </tr>
  `).join('');
}

window.openComplaint = function(id) {
  currentComplaintId = id;
  renderSidebarList();
  renderTable();
};

window.switchSidebarView = function(view) {
  const items = document.querySelectorAll('.sidebar-nav .nav-item');
  items.forEach(el => el.classList.remove('active'));
  if (view === 'dashboard') {
    if (items[0]) items[0].classList.add('active');
    const list = document.getElementById('complaint-list');
    if (list) list.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    if (items[1]) items[1].classList.add('active');
    const list = document.getElementById('complaint-list');
    if (list) {
      list.style.display = list.style.display === 'none' ? 'flex' : 'none';
    }
    const tableCard = document.querySelector('.table-card');
    if (tableCard) tableCard.scrollIntoView({ behavior: 'smooth' });
  }
};

window.onSearchChange = function(val) {
  const q = val.toLowerCase();
  filteredComplaints = allComplaints.filter(c =>
    c.customerName.toLowerCase().includes(q) || c.productName.toLowerCase().includes(q) ||
    c.complaint.toLowerCase().includes(q) || c.displayDate.includes(q) || c.id.toLowerCase().includes(q)
  );
  renderSidebarList();
  renderTable();
}

window.openNewModal = function() { document.getElementById('modal-overlay').style.display = 'flex'; }
window.closeModal = function() { document.getElementById('modal-overlay').style.display = 'none'; }

let _editId = null;
window.openEditModal = function(id) {
  const c = allComplaints.find(x => x.id === id);
  if (!c) return;
  _editId = id;
  document.getElementById('edit-modal-id').textContent = id;
  document.getElementById('e-status').value = c.status || 'Open';
  document.getElementById('e-action').value = c.actionTaken || '';
  document.getElementById('e-remarks').value = c.remarks || '';
  const closingParts = (c.closingDate || '').split('/');
  if (closingParts.length === 3) {
    const iso = `${closingParts[2]}-${closingParts[1].padStart(2,'0')}-${closingParts[0].padStart(2,'0')}`;
    document.getElementById('e-closing').value = iso;
  } else {
    document.getElementById('e-closing').value = new Date().toISOString().split('T')[0];
  }
  document.getElementById('edit-modal-overlay').style.display = 'flex';
};
window.closeEditModal = function() { document.getElementById('edit-modal-overlay').style.display = 'none'; };

window.saveEditComplaint = async function() {
  if (!_editId) return;
  const idx = allComplaints.findIndex(x => x.id === _editId);
  if (idx === -1) return;
  const c = allComplaints[idx];
  const status = document.getElementById('e-status').value;
  const action = document.getElementById('e-action').value.trim();
  const remarks = document.getElementById('e-remarks').value.trim();
  const closingVal = document.getElementById('e-closing').value;
  const closingDate = closingVal ? formatDate(new Date(closingVal + 'T00:00:00')) : c.closingDate;

  const updated = { ...c, status, actionTaken: action || c.actionTaken, remarks: remarks || c.remarks, closingDate };
  const btn = document.getElementById('save-edit-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;
  const ok = await saveComplaint(_editId, updated);
  btn.textContent = 'Save Changes'; btn.disabled = false;
  if (ok) {
    allComplaints[idx] = updated;
    filteredComplaints = [...allComplaints];
    renderStats(); renderTable(); renderSidebarList();
    closeEditModal();
  }
};

window.saveNewComplaint = async function() {
  const dateVal = document.getElementById('n-date').value;
  const custName = document.getElementById('n-customer').value.trim();
  const contact = document.getElementById('n-contact').value.trim();
  const product = document.getElementById('n-product').value.trim();
  const complaint = document.getElementById('n-complaint').value.trim();
  const action = document.getElementById('n-action').value.trim();
  const status = document.getElementById('n-status').value;
  const remarks = document.getElementById('n-remarks').value.trim();

  if (!dateVal || !custName || !product || !complaint) { alert('Please fill required fields.'); return; }

  const newId = `CC-${String(allComplaints.length + 1).padStart(4,'0')}-M`;
  let batch = document.getElementById('n-batch').value.trim();
  const d = new Date(dateVal + 'T00:00:00');
  if (!batch) {
    batch = formatBatchNumber(product, d);
  } else if (!batch.toLowerCase().startsWith('batch no.')) {
    batch = `Batch No. ${batch}`;
  }
  const closingD = new Date(d); closingD.setDate(closingD.getDate() + 1);

  const record = {
    id: newId, srNo: allComplaints.length + 1,
    date: dateVal, displayDate: formatDate(d),
    customerName: custName, contactNo: contact,
    productName: product, batchNo: batch,
    complaint, actionTaken: action,
    closingDate: formatDate(closingD),
    status, remarks, isGenerated: false
  };

  const btn = document.getElementById('save-complaint-btn');
  btn.textContent = 'Saving...'; btn.disabled = true;
  const ok = await saveComplaint(newId, record);
  btn.textContent = 'Save Complaint'; btn.disabled = false;

  if (ok) {
    allComplaints.unshift(record);
    allComplaints.sort((a, b) => b.date.localeCompare(a.date));
    filteredComplaints = [...allComplaints];
    renderStats(); renderTable(); openComplaint(newId); closeModal();
  }
}

window.exportExcel = function() {
  const wb = XLSX.utils.book_new();
  const headers = ['Sr.No.', 'Date', 'Customer Name', 'Contact No.', 'Product Name', 'Batch No.', 'Complaint Details', 'Action Taken', 'Closing Date', 'Status', 'Remarks'];
  const rows = [headers, ...allComplaints.map(c => [c.srNo, c.displayDate, c.customerName, c.contactNo, c.productName, c.batchNo, c.complaint, c.actionTaken, c.closingDate, c.status, c.remarks])];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [5,12,18,13,18,14,28,32,12,8,16].map(w => ({wch:w}));
  XLSX.utils.book_append_sheet(wb, ws, 'Complaint Register');
  XLSX.writeFile(wb, `LV_Spices_Complaints_${new Date().toISOString().split('T')[0]}.xlsx`);
}

window.printPage = function() { window.print(); }
window.toggleSidebar = function() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('overlay').classList.toggle('show'); }
window.closeSidebar = function() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('show'); }

init();
