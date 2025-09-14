// IT Envanter ve Zimmet Takip Sistemi - Frontend JavaScript

// Global değişkenler
let currentTab = 'employees';
let employees = [];
let equipment = [];
let assignments = [];
let currentEmployee = null;
let currentEquipment = null;
let currentAssignment = null;

// API Base URL
const API_BASE = '/api';

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Uygulamayı başlat
function initializeApp() {
    loadTheme();
    setupEventListeners();
    loadDashboard();
    loadEmployees();
    loadEquipment();
    loadActiveAssignments();
    
    // Saat güncelleme
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Event listener'ları kur
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            switchTab(this.dataset.tab);
        });
    });

    // Form submissions
    document.getElementById('employeeForm').addEventListener('submit', handleEmployeeSubmit);
    document.getElementById('equipmentForm').addEventListener('submit', handleEquipmentSubmit);
    document.getElementById('assignmentForm').addEventListener('submit', handleAssignmentSubmit);

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// Tab değiştirme
function switchTab(tabName) {
    // Tüm tab'ları gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Tüm nav link'lerini deaktif et
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Seçilen tab'ı göster
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Seçilen nav link'ini aktif et
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    currentTab = tabName;
    
    // Tab'a özel işlemler
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'employees') {
        loadEmployees();
    } else if (tabName === 'equipment') {
        loadEquipment();
    } else if (tabName === 'assignments') {
        loadActiveAssignments();
    }
}

// Dashboard yükleme
async function loadDashboard() {
    try {
        const [employeesRes, equipmentRes, assignmentsRes] = await Promise.all([
            fetch(`${API_BASE}/employees`),
            fetch(`${API_BASE}/equipment`),
            fetch(`${API_BASE}/assignments/active/list`)
        ]);

        const employeesData = await employeesRes.json();
        const equipmentData = await equipmentRes.json();
        const assignmentsData = await assignmentsRes.json();

        if (employeesData.success) {
            employees = employeesData.data;
            document.getElementById('totalEmployees').textContent = employees.length;
        }

        if (equipmentData.success) {
            equipment = equipmentData.data;
            document.getElementById('totalEquipment').textContent = equipment.length;
            
            // Kategori sayılarını hesapla
            const categoryCounts = {};
            equipment.forEach(item => {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            });
            
            // Kategori sayılarını güncelle
            document.getElementById('laptopCount').textContent = categoryCounts['Dizüstü Bilgisayar'] || 0;
            document.getElementById('desktopCount').textContent = categoryCounts['Masaüstü Bilgisayar'] || 0;
            document.getElementById('phoneCount').textContent = categoryCounts['Cep Telefonu'] || 0;
            document.getElementById('deskPhoneCount').textContent = categoryCounts['Masa Telefonu'] || 0;
            document.getElementById('tabletCount').textContent = categoryCounts['Tablet'] || 0;
            document.getElementById('monitorCount').textContent = categoryCounts['Monitör'] || 0;
            document.getElementById('otherCount').textContent = categoryCounts['Diğer'] || 0;
        }

        if (assignmentsData.success) {
            assignments = assignmentsData.data;
            const activeAssignments = assignments.filter(a => !a.returned_date);
            document.getElementById('assignedEquipment').textContent = activeAssignments.length;
            
            // Atama oranını hesapla
            const assignmentRate = equipment.length > 0 ? Math.round((activeAssignments.length / equipment.length) * 100) : 0;
            document.getElementById('assignmentRate').textContent = assignmentRate;
            
            // Boşta cihaz sayısı
            const availableCount = equipment.length - activeAssignments.length;
            document.getElementById('availableEquipment').textContent = availableCount;
        }
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
        showAlert('Dashboard verileri yüklenirken hata oluştu.', 'danger');
    }
}

// Çalışanları yükle
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE}/employees`);
        const data = await response.json();
        
        if (data.success) {
            employees = data.data;
            renderEmployeeTable();
            updateEmployeeSelect();
        } else {
            showAlert('Çalışanlar yüklenirken hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Çalışan yükleme hatası:', error);
        showAlert('Çalışanlar yüklenirken hata oluştu.', 'danger');
    }
}

// Çalışan tablosunu render et
function renderEmployeeTable() {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.email || '-'}</td>
            <td>${employee.department || '-'}</td>
            <td>${employee.position || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Çalışan seçim listesini güncelle
function updateEmployeeSelect() {
    const select = document.getElementById('assignmentEmployee');
    select.innerHTML = '<option value="">Çalışan Seçin</option>';
    
    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee.id;
        option.textContent = employee.name;
        select.appendChild(option);
    });
}

// Çalışan form submit
async function handleEmployeeSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('employeeName').value,
        email: document.getElementById('employeeEmail').value,
        department: document.getElementById('employeeDepartment').value,
        position: document.getElementById('employeePosition').value,
        mobile_phone: document.getElementById('employeeMobile').value,
        desk_phone: document.getElementById('employeeDesk').value
    };
    
    const employeeId = document.getElementById('employeeId').value;
    const isEdit = employeeId !== '';
    
    try {
        const url = isEdit ? `${API_BASE}/employees/${employeeId}` : `${API_BASE}/employees`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(isEdit ? 'Çalışan başarıyla güncellendi.' : 'Çalışan başarıyla eklendi.', 'success');
            clearEmployeeForm();
            loadEmployees();
            loadDashboard();
        } else {
            showAlert(data.message || 'Bir hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Çalışan kaydetme hatası:', error);
        showAlert('Çalışan kaydedilirken hata oluştu.', 'danger');
    }
}

// Çalışan düzenle
function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (employee) {
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeEmail').value = employee.email || '';
        document.getElementById('employeeDepartment').value = employee.department || '';
        document.getElementById('employeePosition').value = employee.position || '';
        document.getElementById('employeeMobile').value = employee.mobile_phone || '';
        document.getElementById('employeeDesk').value = employee.desk_phone || '';
        
        // Formu scroll et
        document.getElementById('employeeForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Çalışan sil
async function deleteEmployee(id) {
    if (confirm('Bu çalışanı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`${API_BASE}/employees/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('Çalışan başarıyla silindi.', 'success');
                loadEmployees();
                loadDashboard();
            } else {
                showAlert(data.message || 'Çalışan silinirken hata oluştu.', 'danger');
            }
        } catch (error) {
            console.error('Çalışan silme hatası:', error);
            showAlert('Çalışan silinirken hata oluştu.', 'danger');
        }
    }
}

// Çalışan formunu temizle
function clearEmployeeForm() {
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
}

// Donanımları yükle
async function loadEquipment() {
    try {
        const response = await fetch(`${API_BASE}/equipment`);
        const data = await response.json();
        
        if (data.success) {
            equipment = data.data;
            renderEquipmentTable();
            updateEquipmentSelect();
        } else {
            showAlert('Donanımlar yüklenirken hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Donanım yükleme hatası:', error);
        showAlert('Donanımlar yüklenirken hata oluştu.', 'danger');
    }
}

// Donanım tablosunu render et
function renderEquipmentTable() {
    const tbody = document.getElementById('equipmentTableBody');
    tbody.innerHTML = '';
    
    equipment.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.category}</td>
            <td>${item.brand || '-'}</td>
            <td>${item.model || '-'}</td>
            <td>${item.serial_number || '-'}</td>
            <td><span class="badge ${getStatusClass(item.status)}">${getStatusText(item.status)}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editEquipment(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEquipment(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Donanım seçim listesini güncelle
function updateEquipmentSelect() {
    const select = document.getElementById('assignmentEquipment');
    select.innerHTML = '<option value="">Donanım Seçin</option>';
    
    const availableEquipment = equipment.filter(item => item.status === 'available');
    availableEquipment.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.category} - ${item.brand} ${item.model}`;
        select.appendChild(option);
    });
}

// Donanım form submit
async function handleEquipmentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        category: document.getElementById('equipmentCategory').value,
        serial_number: document.getElementById('equipmentSerial').value,
        brand: document.getElementById('equipmentBrand').value,
        model: document.getElementById('equipmentModel').value,
        status: document.getElementById('equipmentStatus').value
    };
    
    // Dinamik alanları ekle
    const dynamicFields = document.querySelectorAll('#dynamicFields input, #dynamicFields select, #dynamicFields textarea');
    dynamicFields.forEach(field => {
        if (field.value) {
            formData[field.id.replace('equipment', '').toLowerCase()] = field.value;
        }
    });
    
    const equipmentId = document.getElementById('equipmentId').value;
    const isEdit = equipmentId !== '';
    
    try {
        const url = isEdit ? `${API_BASE}/equipment/${equipmentId}` : `${API_BASE}/equipment`;
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert(isEdit ? 'Donanım başarıyla güncellendi.' : 'Donanım başarıyla eklendi.', 'success');
            clearEquipmentForm();
            loadEquipment();
            loadDashboard();
        } else {
            showAlert(data.message || 'Bir hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Donanım kaydetme hatası:', error);
        showAlert('Donanım kaydedilirken hata oluştu.', 'danger');
    }
}

// Donanım düzenle
function editEquipment(id) {
    const item = equipment.find(e => e.id === id);
    if (item) {
        document.getElementById('equipmentId').value = item.id;
        document.getElementById('equipmentCategory').value = item.category;
        document.getElementById('equipmentSerial').value = item.serial_number || '';
        document.getElementById('equipmentBrand').value = item.brand || '';
        document.getElementById('equipmentModel').value = item.model || '';
        document.getElementById('equipmentStatus').value = item.status;
        
        // Dinamik alanları güncelle
        toggleEquipmentFields();
        
        // Formu scroll et
        document.getElementById('equipmentForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Donanım sil
async function deleteEquipment(id) {
    if (confirm('Bu donanımı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`${API_BASE}/equipment/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                showAlert('Donanım başarıyla silindi.', 'success');
                loadEquipment();
                loadDashboard();
            } else {
                showAlert(data.message || 'Donanım silinirken hata oluştu.', 'danger');
            }
        } catch (error) {
            console.error('Donanım silme hatası:', error);
            showAlert('Donanım silinirken hata oluştu.', 'danger');
        }
    }
}

// Donanım formunu temizle
function clearEquipmentForm() {
    document.getElementById('equipmentForm').reset();
    document.getElementById('equipmentId').value = '';
    document.getElementById('dynamicFields').innerHTML = '';
}

// Donanım kategorisine göre alanları göster/gizle
function toggleEquipmentFields() {
    const category = document.getElementById('equipmentCategory').value;
    const dynamicFields = document.getElementById('dynamicFields');
    
    dynamicFields.innerHTML = '';
    
    if (category === 'Dizüstü Bilgisayar' || category === 'Masaüstü Bilgisayar') {
        dynamicFields.innerHTML = `
            <div class="mb-3">
                <label for="equipmentWifiMac" class="form-label">WiFi MAC Adresi</label>
                <input type="text" class="form-control" id="equipmentWifiMac" placeholder="00:11:22:33:44:55">
            </div>
            <div class="mb-3">
                <label for="equipmentLanMac" class="form-label">LAN MAC Adresi</label>
                <input type="text" class="form-control" id="equipmentLanMac" placeholder="00:11:22:33:44:55">
            </div>
            <div class="mb-3">
                <label for="equipmentCpu" class="form-label">CPU</label>
                <input type="text" class="form-control" id="equipmentCpu" placeholder="Intel Core i7-10700K">
            </div>
            <div class="mb-3">
                <label for="equipmentGpu" class="form-label">GPU</label>
                <input type="text" class="form-control" id="equipmentGpu" placeholder="NVIDIA GeForce RTX 3070">
            </div>
            <div class="mb-3">
                <label for="equipmentRam" class="form-label">RAM</label>
                <input type="text" class="form-control" id="equipmentRam" placeholder="16GB DDR4">
            </div>
            <div class="mb-3">
                <label for="equipmentStorage" class="form-label">Depolama</label>
                <input type="text" class="form-control" id="equipmentStorage" placeholder="512GB SSD">
            </div>
        `;
    } else if (category === 'Cep Telefonu' || category === 'Tablet') {
        dynamicFields.innerHTML = `
            <div class="mb-3">
                <label for="equipmentWifiMac" class="form-label">WiFi MAC Adresi</label>
                <input type="text" class="form-control" id="equipmentWifiMac" placeholder="00:11:22:33:44:55">
            </div>
        `;
    } else if (category === 'Diğer') {
        dynamicFields.innerHTML = `
            <div class="mb-3">
                <label for="equipmentDescription" class="form-label">Açıklama *</label>
                <textarea class="form-control" id="equipmentDescription" rows="3" required></textarea>
            </div>
        `;
    }
}

// Donanım filtreleme
function filterEquipment() {
    const filter = document.getElementById('equipmentFilter').value;
    const rows = document.querySelectorAll('#equipmentTableBody tr');
    
    rows.forEach(row => {
        const category = row.cells[0].textContent;
        if (filter === '' || category === filter) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Aktif zimmetleri yükle
async function loadActiveAssignments() {
    try {
        const response = await fetch(`${API_BASE}/assignments/active/list`);
        const data = await response.json();
        
        if (data.success) {
            assignments = data.data;
            renderAssignmentTable();
        } else {
            showAlert('Zimmet atamaları yüklenirken hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Zimmet yükleme hatası:', error);
        showAlert('Zimmet atamaları yüklenirken hata oluştu.', 'danger');
    }
}

// Tüm zimmetleri yükle
async function loadAllAssignments() {
    try {
        const response = await fetch(`${API_BASE}/assignments`);
        const data = await response.json();
        
        if (data.success) {
            assignments = data.data;
            renderAssignmentTable();
        } else {
            showAlert('Zimmet atamaları yüklenirken hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Zimmet yükleme hatası:', error);
        showAlert('Zimmet atamaları yüklenirken hata oluştu.', 'danger');
    }
}

// Zimmet tablosunu render et
function renderAssignmentTable() {
    const tbody = document.getElementById('assignmentTableBody');
    tbody.innerHTML = '';
    
    assignments.forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.employee_name}</td>
            <td>${assignment.equipment_name}</td>
            <td>${formatDate(assignment.assigned_date)}</td>
            <td>${assignment.returned_date ? formatDate(assignment.returned_date) : '-'}</td>
            <td><span class="badge ${assignment.returned_date ? 'bg-secondary' : 'bg-success'}">${assignment.returned_date ? 'İade Edildi' : 'Aktif'}</span></td>
            <td>
                ${!assignment.returned_date ? `
                    <button class="btn btn-sm btn-outline-warning" onclick="showReturnModal(${assignment.id})">
                        <i class="fas fa-undo"></i> İade Et
                    </button>
                ` : '-'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Zimmet form submit
async function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    const formData = {
        employee_id: parseInt(document.getElementById('assignmentEmployee').value),
        equipment_id: parseInt(document.getElementById('assignmentEquipment').value),
        notes: document.getElementById('assignmentNotes').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Zimmet başarıyla atandı.', 'success');
            document.getElementById('assignmentForm').reset();
            loadActiveAssignments();
            loadEquipment();
            loadDashboard();
        } else {
            showAlert(data.message || 'Bir hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Zimmet atama hatası:', error);
        showAlert('Zimmet atanırken hata oluştu.', 'danger');
    }
}

// İade modalını göster
function showReturnModal(assignmentId) {
    document.getElementById('returnAssignmentId').value = assignmentId;
    const modal = new bootstrap.Modal(document.getElementById('returnModal'));
    modal.show();
}

// İade onayla
async function confirmReturn() {
    const assignmentId = document.getElementById('returnAssignmentId').value;
    const returnReason = document.getElementById('returnReason').value;
    const returnNotes = document.getElementById('returnNotes').value;
    
    if (!returnReason) {
        showAlert('İade nedeni seçilmelidir.', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/assignments/${assignmentId}/return`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                return_reason: returnReason,
                notes: returnNotes
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showAlert('Zimmet başarıyla iade edildi.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('returnModal')).hide();
            document.getElementById('returnForm').reset();
            loadActiveAssignments();
            loadEquipment();
            loadDashboard();
        } else {
            showAlert(data.message || 'Bir hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Zimmet iade hatası:', error);
        showAlert('Zimmet iade edilirken hata oluştu.', 'danger');
    }
}

// Rapor modalını göster
function showReportModal() {
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

// Rapor oluştur
async function generateReport(type) {
    try {
        const response = await fetch(`${API_BASE}/reports/${type}`, {
            method: 'GET'
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_raporu_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showAlert('Rapor başarıyla indirildi.', 'success');
        } else {
            showAlert('Rapor oluşturulurken hata oluştu.', 'danger');
        }
    } catch (error) {
        console.error('Rapor oluşturma hatası:', error);
        showAlert('Rapor oluşturulurken hata oluştu.', 'danger');
    }
}

// Tema değiştirme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Tema yükleme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Çıkış yap
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        window.location.href = '/login';
    }
}

// Tarih formatla
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

// Durum sınıfı al
function getStatusClass(status) {
    switch (status) {
        case 'available': return 'bg-success';
        case 'assigned': return 'bg-warning';
        case 'broken': return 'bg-danger';
        case 'old': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// Durum metni al
function getStatusText(status) {
    switch (status) {
        case 'available': return 'Boşta';
        case 'assigned': return 'Sahipli';
        case 'broken': return 'Arızalı';
        case 'old': return 'Eski';
        default: return 'Bilinmiyor';
    }
}

// Alert göster
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 5 saniye sonra otomatik kapat
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Saat güncelleme
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR');
    const dateString = now.toLocaleDateString('tr-TR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Saat ve tarih bilgisini navbar'a ekle (isteğe bağlı)
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        timeElement.textContent = `${dateString} - ${timeString}`;
    }
}