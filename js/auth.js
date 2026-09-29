// Đường dẫn Base URL backend Spring Boot
const API_BASE_URL = 'http://localhost:8080';

// Global Event Listener
document.addEventListener('DOMContentLoaded', () => {
    // 1. Khởi tạo sự kiện Form Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 2. Khởi tạo sự kiện Form Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        toggleStudentClassInput(); // Tự động ẩn/hiện ô lớp sinh viên đúng trạng thái ban đầu
    }

    // 3. Khởi tạo trang Profile (Load dữ liệu người dùng)
    if (window.location.pathname.includes('profile.html')) {
        loadUserProfile();
    }

    // 4. Khởi tạo sự kiện Form Change Password
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handleChangePassword);
    }
});

// ==========================================
// 1. XỬ LÝ ĐĂNG NHẬP (POST /api/auth/login)
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Lưu JWT Token vào LocalStorage
            localStorage.setItem('jwtToken', result.data.token);
            alert('Đăng nhập thành công!');
            window.location.href = 'profile.html';
        } else {
            alert(result.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
        }
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        alert('Không thể kết nối đến máy chủ Backend (http://localhost:8080)!');
    }
}

// ==========================================
// 2. XỬ LÝ ĐĂNG KÝ (POST /api/auth/register)
// ==========================================
async function handleRegister(e) {
    e.preventDefault();

    // Lấy giá trị ID Bộ môn an toàn, tránh lỗi parseInt bị NaN khi để trống
    const deptVal = document.getElementById('departmentId')?.value;

    const payload = {
        username: document.getElementById('regUsername').value.trim(),
        password: document.getElementById('regPassword').value,
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        code: document.getElementById('code').value.trim(),
        role: document.getElementById('role').value,
        departmentId: deptVal ? parseInt(deptVal) : null, // Gán null nếu người dùng để trống
        studentClass: document.getElementById('studentClass')?.value.trim() || ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('Đăng ký tài khoản thành công! Hãy đăng nhập.');
            window.location.href = 'index.html';
        } else {
            alert(result.message || 'Đăng ký thất bại!');
        }
    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        alert('Lỗi kết nối máy chủ!');
    }
}

// Dynamic Ẩn/Hiện ô Lớp Sinh Viên theo Role (Đã kiểm tra null an toàn)
function toggleStudentClassInput() {
    const roleEl = document.getElementById('role');
    const group = document.getElementById('studentClassGroup');

    // Kiểm tra an toàn: Nếu không tìm thấy phần tử ở trang hiện tại thì dừng
    if (!roleEl || !group) return;

    if (roleEl.value === 'ROLE_LECTURER') {
        group.style.display = 'none';
    } else {
        group.style.display = 'block';
    }
}

// ==========================================
// 3. XỬ LÝ LẤY THÔNG TIN (GET /api/auth/me)
// ==========================================
async function loadUserProfile() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Bạn chưa đăng nhập!');
        window.location.href = 'index.html';
        return;
    }

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
            const data = result.data;
            document.getElementById('profFullName').innerText = data.fullName || '-';
            document.getElementById('profUsername').innerText = data.username || '-';
            document.getElementById('profEmail').innerText = data.email || '-';
            document.getElementById('profPhone').innerText = data.phone || '-';
            document.getElementById('profCode').innerText = data.code || '-';
            document.getElementById('profRole').innerText = data.role || '-';
            document.getElementById('profDept').innerText = data.departmentName || 'Chưa cập nhật';
            document.getElementById('profClass').innerText = data.studentClass || 'N/A';
        } else {
            alert('Phiên đăng nhập đã hết hạn.');
            logout();
        }
    } catch (error) {
        console.error('Lỗi tải thông tin cá nhân:', error);
    }
}

// ==========================================
// 4. XỬ LÝ ĐỔI MẬT KHẨU (POST /api/auth/change-password)
// ==========================================
async function handleChangePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert('Phiên làm việc hết hạn!');
        logout();
        return;
    }

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert('Đổi mật khẩu thành công!');
            closePasswordModal();
            document.getElementById('changePasswordForm').reset();
        } else {
            alert(result.message || 'Đổi mật khẩu thất bại!');
        }
    } catch (error) {
        console.error('Lỗi đổi mật khẩu:', error);
    }
}

// Modal Toggle Functions
function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.style.display = 'flex';
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.style.display = 'none';
}

// Hàm Đăng xuất
function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = 'index.html';
}