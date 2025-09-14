const XLSX = require('xlsx');
const Employee = require('../models/Employee');
const Equipment = require('../models/Equipment');
const Assignment = require('../models/Assignment');
const Accessory = require('../models/Accessory');

// Çalışan listesi raporu
async function getEmployeesReport(req, res) {
    try {
        const employees = await Employee.getAll();
        
        // Excel için veri hazırla
        const excelData = employees.map(emp => ({
            'ID': emp.id,
            'Ad Soyad': emp.name,
            'E-posta': emp.email || '',
            'Departman': emp.department || '',
            'Pozisyon': emp.position || '',
            'Cep Telefonu': emp.mobile_phone || '',
            'Masa Telefonu': emp.desk_phone || '',
            'Kayıt Tarihi': emp.created_at,
            'Güncelleme Tarihi': emp.updated_at || ''
        }));

        // Excel dosyası oluştur
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Çalışan Listesi');

        // Excel dosyasını buffer olarak al
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="calisan_listesi.xlsx"');
        
        res.send(excelBuffer);
    } catch (error) {
        console.error('Çalışan raporu hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Çalışan raporu oluşturulamadı: ' + error.message
        });
    }
}

// Donanım listesi raporu
async function getEquipmentReport(req, res) {
    try {
        const equipment = await Equipment.getAll();
        
        // Her donanım için aksesuarları al
        const equipmentWithAccessories = await Promise.all(
            equipment.map(async (eq) => {
                const accessories = await Accessory.getByEquipment(eq.id);
                return { ...eq, accessories };
            })
        );
        
        // Excel için veri hazırla
        const excelData = equipmentWithAccessories.map(eq => {
            const baseData = {
                'ID': eq.id,
                'Kategori': eq.category,
                'Marka': eq.brand || '',
                'Model': eq.model || '',
                'Seri Numarası': eq.serial_number || '',
                'Durum': eq.status === 'available' ? 'Boşta' : 'Atanmış',
                'WiFi MAC': eq.wifi_mac || '',
                'LAN MAC': eq.lan_mac || '',
                'CPU': eq.cpu || '',
                'GPU': eq.gpu || '',
                'RAM': eq.ram || '',
                'Depolama': eq.storage || '',
                'Açıklama': eq.description || '',
                'Aktif': eq.is_active === 1 ? 'Evet' : 'Hayır',
                'Kayıt Tarihi': eq.created_at,
                'Güncelleme Tarihi': eq.updated_at || ''
            };
            
            // Aksesuarları ekle (maksimum 10 adet)
            for (let i = 1; i <= 10; i++) {
                const accessory = eq.accessories[i - 1];
                if (accessory) {
                    baseData[`Aksesuar ${i} Türü`] = accessory.accessory_type || '';
                    baseData[`Aksesuar ${i} Adı`] = accessory.accessory_name || '';
                } else {
                    baseData[`Aksesuar ${i} Türü`] = '';
                    baseData[`Aksesuar ${i} Adı`] = '';
                }
            }
            
            return baseData;
        });

        // Excel dosyası oluştur
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Donanım Listesi');

        // Excel dosyasını buffer olarak al
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="donanim_listesi.xlsx"');
        
        res.send(excelBuffer);
    } catch (error) {
        console.error('Donanım raporu hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Donanım raporu oluşturulamadı: ' + error.message
        });
    }
}

// Zimmet listesi raporu
async function getAssignmentsReport(req, res) {
    try {
        const assignments = await Assignment.getAll();
        
        // Her zimmet için donanımın aksesuarlarını al
        const assignmentsWithAccessories = await Promise.all(
            assignments.map(async (assignment) => {
                const accessories = await Accessory.getByEquipment(assignment.equipment_id);
                return { ...assignment, accessories };
            })
        );
        
        // Excel için veri hazırla
        const excelData = assignmentsWithAccessories.map(assignment => {
            const baseData = {
                'Atama ID': assignment.id,
                'Çalışan Adı': assignment.employee_name,
                'Çalışan Departmanı': assignment.employee_department || '',
                'Donanım Kategorisi': assignment.equipment_category,
                'Donanım Marka': assignment.equipment_brand || '',
                'Donanım Model': assignment.equipment_model || '',
                'Donanım Seri No': assignment.equipment_serial || '',
                'Atama Tarihi': assignment.assigned_date,
                'İade Tarihi': assignment.returned_date || 'Aktif',
                'Durum': assignment.returned_date ? 'İade Edildi' : 'Aktif',
                'Notlar': assignment.notes || '',
                'İade Nedeni': assignment.return_reason || '',
                'Kayıt Tarihi': assignment.created_at,
                'Güncelleme Tarihi': assignment.updated_at || ''
            };
            
            // Aksesuarları ekle (maksimum 10 adet)
            for (let i = 1; i <= 10; i++) {
                const accessory = assignment.accessories[i - 1];
                if (accessory) {
                    baseData[`Aksesuar ${i} Türü`] = accessory.accessory_type || '';
                    baseData[`Aksesuar ${i} Adı`] = accessory.accessory_name || '';
                } else {
                    baseData[`Aksesuar ${i} Türü`] = '';
                    baseData[`Aksesuar ${i} Adı`] = '';
                }
            }
            
            return baseData;
        });

        // Excel dosyası oluştur
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Zimmet Listesi');

        // Excel dosyasını buffer olarak al
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="zimmet_listesi.xlsx"');
        
        res.send(excelBuffer);
    } catch (error) {
        console.error('Zimmet raporu hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Zimmet raporu oluşturulamadı: ' + error.message
        });
    }
}

module.exports = {
    getEmployeesReport,
    getEquipmentReport,
    getAssignmentsReport
};