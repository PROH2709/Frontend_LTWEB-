// Cổng Backend chuẩn: 8080
const API_BASE_URL = 'http://localhost:8080';

// Ánh xạ vai trò ra tiếng Việt
function formatRoleName(role) {
    const roleMap = {
        'ROLE_ADMIN': 'Quản trị viên',
        'ROLE_DEAN': 'Trưởng khoa',
        'ROLE_DEPARTMENT_HEAD': 'Trưởng bộ môn',
        'ROLE_LECTURER': 'Giảng viên',
        'ROLE_STUDENT': 'Sinh viên'
    };
    return roleMap[role] || role;
}

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem đã đăng nhập (có Token) chưa
    const token = getToken();
    if (!token) {
        showTableMessage('⚠️ Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng <a href="index.html" style="color: var(--primary); font-weight: 600;">Đăng nhập lại</a>.');
        return;
    }

    checkUserPermission();
    loadUsers();

    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) createUserForm.addEventListener('submit', handleCreateUser);

    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) editUserForm.addEventListener('submit', handleEditUser);
});

function getToken() {
    return localStorage.getItem('jwtToken');
}

// Kiểm tra quyền hiển thị nút "Tạo người dùng mới"
async function checkUserPermission() {
    const token = getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            const currentRole = result.data.role;
            const btnCreate = document.getElementById('btnOpenCreateUser');
            if (btnCreate && currentRole !== 'ROLE_ADMIN' && currentRole !== 'ROLE_DEAN') {
                btnCreate.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra phân quyền:', error);
    }
}

// 1. LẤY DANH SÁCH NGƯỜI DÙNG
async function loadUsers() {
    const role = document.getElementById('filterRole')?.value || '';
    const departmentId = document.getElementById('filterDepartmentId')?.value || '';
    const keyword = document.getElementById('filterKeyword')?.value || '';

    let queryParams = new URLSearchParams();
    if (role) queryParams.append('role', role);
    if (departmentId) queryParams.append('departmentId', departmentId);
    if (keyword) queryParams.append('keyword', keyword);

    try {
        const response = await fetch(`${API_BASE_URL}/api/users?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401 || response.status === 403) {
            showTableMessage('🔒 Không có quyền truy cập hoặc Token hết hạn. Vui lòng <a href="index.html" style="color: var(--primary); font-weight: 600;">Đăng nhập lại</a>.');
            return;
        }

        const result = await response.json();
        if (response.ok && result.success) {
            renderUserTable(result.data);
        } else {
            showTableMessage(`❌ Lỗi: ${result.message || 'Không thể tải danh sách người dùng'}`);
        }
    } catch (error) {
        console.error('Lỗi kết nối API:', error);
        showTableMessage('❌ Không kết nối được đến Server (http://localhost:8080). Hãy chắc chắn Backend Spring Boot đang chạy.');
    }
}

// Render dữ liệu ra HTML Table
function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    if (!users || users.length === 0) {
        showTableMessage('Không tìm thấy người dùng nào.');
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><strong>${user.code || '-'}</strong></td>
            <td>${user.fullName}</td>
            <td>${user.username}</td>
            <td>${user.email}<br><small style="color: var(--text-muted);">${user.phone || ''}</small></td>
            <td><span class="badge badge-role">${formatRoleName(user.role)}</span></td>
            <td>${user.departmentName || '-'}<br><small style="color: var(--text-muted);">${user.studentClass || ''}</small></td>
            <td>
                <span class="badge ${user.active ? 'badge-success' : 'badge-danger'}">
                    ${user.active ? 'Hoạt động' : 'Đã khóa'}
                </span>
            </td>
            <td style="text-align: right;">
                <button onclick="openEditUserModal(${user.id})" class="btn btn-sm btn-action-edit">Sửa</button>
                <button onclick="deleteUser(${user.id})" class="btn btn-sm btn-action-delete">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function showTableMessage(msg) {
    const tbody = document.getElementById('userTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px;">${msg}</td></tr>`;
    }
}

// 2. LẤY GIẢNG VIÊN THEO BỘ MÔN
async function loadLecturersByDept() {
    const departmentId = document.getElementById('filterDepartmentId')?.value;
    if (!departmentId || departmentId < 1) {
        alert('Vui lòng nhập ID Bộ môn hợp lệ (lớn hơn 0)!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/lecturers/department/${departmentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            renderUserTable(result.data);
        } else {
            alert(result.message || 'Lỗi khi tải danh sách Giảng viên!');
        }
    } catch (error) {
        console.error('Lỗi API GET Lecturers:', error);
    }
}

// 3. TẠO NGƯỜI DÙNG MỚI
async function handleCreateUser(e) {
    e.preventDefault();

    const deptVal = document.getElementById('createDepartmentId').value;

    const payload = {
        username: document.getElementById('createUsername').value.trim(),
        password: document.getElementById('createPassword').value,
        fullName: document.getElementById('createFullName').value.trim(),
        email: document.getElementById('createEmail').value.trim(),
        phone: document.getElementById('createPhone').value.trim(),
        code: document.getElementById('createCode').value.trim(),
        role: document.getElementById('createRole').value,
        departmentId: deptVal ? parseInt(deptVal) : null, // Sửa lỗi NaN khi để trống
        studentClass: document.getElementById('createStudentClass').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('Tạo người dùng thành công!');
            closeModal('createUserModal');
            document.getElementById('createUserForm').reset();
            loadUsers();
        } else {
            alert(result.message || 'Tạo thất bại!');
        }
    } catch (error) {
        console.error('Lỗi POST /api/users:', error);
    }
}

// 4. LẤY CHI TIẾT & MỞ MODAL SỬA
async function openEditUserModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            const data = result.data;
            document.getElementById('editUserId').value = data.id;
            document.getElementById('editFullName').value = data.fullName || '';
            document.getElementById('editEmail').value = data.email || '';
            document.getElementById('editPhone').value = data.phone || '';
            document.getElementById('editCode').value = data.code || '';
            document.getElementById('editRole').value = data.role;
            document.getElementById('editDepartmentId').value = data.departmentId || '';
            document.getElementById('editStudentClass').value = data.studentClass || '';
            document.getElementById('editActive').value = data.active.toString();

            document.getElementById('editUserModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Lỗi GET user detail:', error);
    }
}

// 5. CẬP NHẬT NGƯỜI DÙNG
async function handleEditUser(e) {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const deptVal = document.getElementById('editDepartmentId').value;

    const payload = {
        fullName: document.getElementById('editFullName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        phone: document.getElementById('editPhone').value.trim(),
        code: document.getElementById('editCode').value.trim(),
        role: document.getElementById('editRole').value,
        departmentId: deptVal ? parseInt(deptVal) : null, // Sửa lỗi NaN khi để trống
        studentClass: document.getElementById('editStudentClass').value.trim(),
        active: document.getElementById('editActive').value === 'true'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('Cập nhật người dùng thành công!');
            closeModal('editUserModal');
            loadUsers();
        } else {
            alert(result.message || 'Cập nhật thất bại!');
        }
    } catch (error) {
        console.error('Lỗi PUT /api/users/{id}:', error);
    }
}

// 6. KHÓA / XÓA NGƯỜI DÙNG
async function deleteUser(id) {
    if (!confirm(`Bạn có chắc chắn muốn khóa/xóa tài khoản ID = ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('Đã xóa/khóa tài khoản thành công!');
            loadUsers();
        } else {
            alert(result.message || 'Thao tác thất bại!');
        }
    } catch (error) {
        console.error('Lỗi DELETE /api/users/{id}:', error);
    }
}

function openCreateUserModal() {
    document.getElementById('createUserModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}