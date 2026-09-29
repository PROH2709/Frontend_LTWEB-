const API_BASE_URL = 'http://localhost:8080';

function getToken() {
    return localStorage.getItem('jwtToken');
}

function formatStatusBadge(status) {
    if (status === 'APPROVED') return '<span class="badge badge-success">Đã duyệt</span>';
    if (status === 'REJECTED') return '<span class="badge badge-danger">Từ chối</span>';
    return '<span class="badge badge-role">Chờ duyệt</span>';
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải bảng dữ liệu ngay lập tức (không chờ dropdown)
    loadTopics();

    // 2. Tải các dropdown bộ lọc và modal
    initDropdowns();

    // 3. Đăng ký sự kiện submit form
    const createForm = document.getElementById('createTopicForm');
    if (createForm) createForm.addEventListener('submit', handleCreateTopic);

    const editForm = document.getElementById('editTopicForm');
    if (editForm) editForm.addEventListener('submit', handleEditTopic);

    const approvalForm = document.getElementById('approvalForm');
    if (approvalForm) approvalForm.addEventListener('submit', handleApproval);
});

// Nạp danh sách Đợt và Bộ môn vào Dropdown Select (Xử lý an toàn)
async function initDropdowns() {
    try {
        const [resPeriods, resDepts] = await Promise.all([
            fetch(`${API_BASE_URL}/api/registration-periods`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).catch(() => null),
            fetch(`${API_BASE_URL}/api/departments`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).catch(() => null)
        ]);

        const dataPeriods = resPeriods ? await resPeriods.json().catch(() => ({})) : {};
        const dataDepts = resDepts ? await resDepts.json().catch(() => ({})) : {};

        const periods = Array.isArray(dataPeriods.data) ? dataPeriods.data : [];
        const depts = Array.isArray(dataDepts.data) ? dataDepts.data : [];

        // Đổ dữ liệu đợt
        const filterPeriod = document.getElementById('filterPeriodId');
        const createPeriod = document.getElementById('createPeriodId');
        if (filterPeriod) filterPeriod.innerHTML = '<option value="">Tất cả đợt</option>' + periods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        if (createPeriod) createPeriod.innerHTML = periods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        // Đổ dữ liệu bộ môn
        const filterDept = document.getElementById('filterDepartmentId');
        const createDept = document.getElementById('createDepartmentId');
        const editDept = document.getElementById('editDepartmentId');
        if (filterDept) filterDept.innerHTML = '<option value="">Tất cả bộ môn</option>' + depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        if (createDept) createDept.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        if (editDept) editDept.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    } catch (err) {
        console.error('Lỗi nạp danh sách đợt/bộ môn:', err);
    }
}

// 1. GET /api/topics - Lấy danh sách đề tài với bộ lọc
async function loadTopics() {
    const periodId = document.getElementById('filterPeriodId')?.value || '';
    const departmentId = document.getElementById('filterDepartmentId')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const keyword = document.getElementById('filterKeyword')?.value.trim() || '';

    let queryParams = new URLSearchParams();
    if (periodId) queryParams.append('periodId', periodId);
    if (departmentId) queryParams.append('departmentId', departmentId);
    if (status) queryParams.append('status', status);
    if (keyword) queryParams.append('keyword', keyword);

    try {
        const response = await fetch(`${API_BASE_URL}/api/topics?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            renderTopicsTable(result.data || []);
        } else {
            showTableMessage(`❌ Lỗi: ${result.message || 'Không thể tải danh sách'}`);
        }
    } catch (error) {
        console.error('Lỗi GET /api/topics:', error);
        showTableMessage('❌ Lỗi kết nối đến máy chủ.');
    }
}

function renderTopicsTable(topics) {
    const tbody = document.getElementById('topicTableBody');
    if (!tbody) return;

    if (!topics || topics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 40px;">Chưa có đề tài nào.</td></tr>';
        return;
    }

    tbody.innerHTML = topics.map(t => `
        <tr>
            <td>${t.id}</td>
            <td><strong>${t.code || '-'}</strong></td>
            <td>
                <strong style="color: #0f172a;">${t.titleVi}</strong><br>
                <small style="color: #64748b; font-style: italic;">${t.titleEn || '-'}</small>
            </td>
            <td>
                <small><strong>BM:</strong> ${t.departmentName || '-'}</small><br>
                <small style="color: #4f46e5;">${t.periodName || '-'}</small>
            </td>
            <td>
                <small><strong>Chính:</strong> ${t.primaryAdvisorName || '-'}</small><br>
                <small style="color: #64748b;"><strong>Đồng:</strong> ${t.coAdvisorName || 'Không có'}</small>
            </td>
            <td><span class="badge badge-secondary">${t.maxStudents || 3} SV</span></td>
            <td>${formatStatusBadge(t.approvalStatus)}</td>
            <td style="text-align: right; white-space: nowrap;">
                <button onclick="openDetailTopicModal(${t.id})" class="btn btn-sm btn-ghost" title="Xem chi tiết">👁️ Chi tiết</button>
                <button onclick="openApprovalModal(${t.id}, '${t.approvalStatus}')" class="btn btn-sm btn-action-edit" style="background-color: #3b82f6; color: white;">✔️ Duyệt</button>
                <button onclick="openEditTopicModal(${t.id})" class="btn btn-sm btn-action-edit">Sửa</button>
                <button onclick="deleteTopic(${t.id})" class="btn btn-sm btn-action-delete">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function showTableMessage(msg) {
    const tbody = document.getElementById('topicTableBody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #94a3b8; padding: 40px;">${msg}</td></tr>`;
}

// 2. POST /api/topics - Đề xuất đề tài mới
async function handleCreateTopic(e) {
    e.preventDefault();
    const coAdvisorVal = document.getElementById('createCoAdvisorId').value;

    const payload = {
        titleVi: document.getElementById('createTitleVi').value.trim(),
        titleEn: document.getElementById('createTitleEn').value.trim(),
        periodId: parseInt(document.getElementById('createPeriodId').value || 1),
        departmentId: parseInt(document.getElementById('createDepartmentId').value || 1),
        maxStudents: parseInt(document.getElementById('createMaxStudents').value || 3),
        coAdvisorId: coAdvisorVal ? parseInt(coAdvisorVal) : 0,
        description: document.getElementById('createDescription').value.trim(),
        requirements: document.getElementById('createRequirements').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/topics`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('✅ Gửi đề xuất đề tài thành công!');
            closeModal('createTopicModal');
            document.getElementById('createTopicForm').reset();
            loadTopics();
        } else {
            alert(result.message || 'Thất bại!');
        }
    } catch (error) {
        console.error('Lỗi POST /api/topics:', error);
    }
}

// 3. GET /api/topics/{id} - Mở Modal Sửa
async function openEditTopicModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/topics/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            const data = result.data;
            document.getElementById('editTopicId').value = data.id;
            document.getElementById('editTitleVi').value = data.titleVi || '';
            document.getElementById('editTitleEn').value = data.titleEn || '';
            document.getElementById('editDepartmentId').value = data.departmentId || '';
            document.getElementById('editMaxStudents').value = data.maxStudents || 3;
            document.getElementById('editCoAdvisorId').value = data.coAdvisorId || '';
            document.getElementById('editDescription').value = data.description || '';
            document.getElementById('editRequirements').value = data.requirements || '';

            document.getElementById('editTopicModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Lỗi GET detail topic:', error);
    }
}

// 4. PUT /api/topics/{id} - Cập nhật đề tài
async function handleEditTopic(e) {
    e.preventDefault();
    const id = document.getElementById('editTopicId').value;
    const coAdvisorVal = document.getElementById('editCoAdvisorId').value;

    const payload = {
        titleVi: document.getElementById('editTitleVi').value.trim(),
        titleEn: document.getElementById('editTitleEn').value.trim(),
        departmentId: parseInt(document.getElementById('editDepartmentId').value || 1),
        maxStudents: parseInt(document.getElementById('editMaxStudents').value || 3),
        coAdvisorId: coAdvisorVal ? parseInt(coAdvisorVal) : 0,
        description: document.getElementById('editDescription').value.trim(),
        requirements: document.getElementById('editRequirements').value.trim()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/topics/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('✅ Cập nhật thông tin đề tài thành công!');
            closeModal('editTopicModal');
            loadTopics();
        } else {
            alert(result.message || 'Cập nhật thất bại!');
        }
    } catch (error) {
        console.error('Lỗi PUT /api/topics/{id}:', error);
    }
}

// 5. PATCH /api/topics/{id}/approval - Duyệt đề tài
function openApprovalModal(id, currentStatus) {
    document.getElementById('approvalTopicId').value = id;
    document.getElementById('approvalStatusSelect').value = currentStatus || 'APPROVED';
    toggleRejectionReason();
    document.getElementById('approvalModal').style.display = 'flex';
}

function toggleRejectionReason() {
    const status = document.getElementById('approvalStatusSelect').value;
    const group = document.getElementById('rejectionReasonGroup');
    if (group) group.style.display = status === 'REJECTED' ? 'block' : 'none';
}

async function handleApproval(e) {
    e.preventDefault();
    const id = document.getElementById('approvalTopicId').value;
    const status = document.getElementById('approvalStatusSelect').value;
    const reason = document.getElementById('rejectionReason').value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/api/topics/${id}/approval`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                approvalStatus: status,
                rejectionReason: status === 'REJECTED' ? reason : ''
            })
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('✅ Đã cập nhật trạng thái phê duyệt!');
            closeModal('approvalModal');
            loadTopics();
        } else {
            alert(result.message || 'Cập nhật thất bại!');
        }
    } catch (error) {
        console.error('Lỗi PATCH approval:', error);
    }
}

// 6. DELETE /api/topics/{id} - Xóa đề tài
async function deleteTopic(id) {
    if (!confirm(`Bạn có chắc muốn xóa đề tài ID = ${id}?`)) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/topics/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert('✅ Đã xóa đề tài!');
            loadTopics();
        } else {
            alert(result.message || 'Xóa thất bại!');
        }
    } catch (error) {
        console.error('Lỗi DELETE /api/topics/{id}:', error);
    }
}

// Modal Chi tiết Đề tài
async function openDetailTopicModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/topics/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        const result = await response.json();
        if (response.ok && result.success) {
            const t = result.data;
            const container = document.getElementById('detailTopicContent');
            container.innerHTML = `
                <div><strong>Mã đề tài:</strong> ${t.code || '-'}</div>
                <div><strong>Tên Tiếng Việt:</strong> ${t.titleVi}</div>
                <div><strong>Tên Tiếng Anh:</strong> ${t.titleEn || '-'}</div>
                <div><strong>Đợt đăng ký:</strong> ${t.periodName || '-'}</div>
                <div><strong>Bộ môn:</strong> ${t.departmentName || '-'}</div>
                <div><strong>GVHD Chính:</strong> ${t.primaryAdvisorName || '-'} (${t.primaryAdvisorEmail || '-'})</div>
                <div><strong>GV Đồng HD:</strong> ${t.coAdvisorName || 'Không có'}</div>
                <div><strong>Số SV tối đa:</strong> ${t.maxStudents || 3} Sinh viên</div>
                <div><strong>Trạng thái duyệt:</strong> ${formatStatusBadge(t.approvalStatus)}</div>
                ${t.rejectionReason ? `<div style="color: #ef4444;"><strong>Lý do từ chối:</strong> ${t.rejectionReason}</div>` : ''}
                <div><strong>Mô tả:</strong> ${t.description || 'Chưa có mô tả'}</div>
                <div><strong>Yêu cầu:</strong> ${t.requirements || 'Chưa có yêu cầu'}</div>
            `;
            document.getElementById('detailTopicModal').style.display = 'flex';
        }
    } catch (err) {
        console.error('Lỗi tải chi tiết:', err);
    }
}

function openCreateTopicModal() {
    document.getElementById('createTopicModal').style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}