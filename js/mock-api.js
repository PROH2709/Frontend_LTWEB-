// FETCH INTERCEPTOR - GIẢ LẬP BACKEND & DỮ LIỆU MẪU TOÀN HỆ THỐNG
(function () {
    const originalFetch = window.fetch;

    // 1. TỰ ĐỘNG KHỞI TẠO TOKEN VÀ DỮ LIỆU MẪU VÀO LOCALSTORAGE
    function initLocalStorage() {
        if (!localStorage.getItem('jwtToken')) {
            localStorage.setItem('jwtToken', 'mock-jwt-token-admin-2026');
        }

        // BẢNG NGƯỜI DÙNG (USERS)
        if (!localStorage.getItem('h2_users')) {
            localStorage.setItem('h2_users', JSON.stringify([
                { id: 1, code: 'ADMIN01', fullName: 'Nguyễn Văn Quản Trị', username: 'admin', email: 'admin@fit.edu.vn', phone: '0901111111', role: 'ROLE_ADMIN', departmentName: 'Công nghệ thông tin', departmentId: 1, studentClass: 'N/A', active: true },
                { id: 2, code: 'GV001', fullName: 'TS. Trần Thị Bình', username: 'tranbinh', email: 'binhtt@fit.edu.vn', phone: '0902222222', role: 'ROLE_LECTURER', departmentName: 'Công nghệ phần mềm', departmentId: 1, studentClass: 'N/A', active: true },
                { id: 3, code: 'GV002', fullName: 'ThS. Lê Hoàng Nam', username: 'namlh', email: 'namlh@fit.edu.vn', phone: '0903333333', role: 'ROLE_DEPARTMENT_HEAD', departmentName: 'Hệ thống thông tin', departmentId: 2, studentClass: 'N/A', active: true },
                { id: 4, code: 'SV2001', fullName: 'Phạm Minh Cường', username: 'cuongpm', email: 'cuongpm@st.edu.vn', phone: '0904444444', role: 'ROLE_STUDENT', departmentName: 'Công nghệ phần mềm', departmentId: 1, studentClass: 'DHCNTT17A', active: true },
                { id: 5, code: 'SV2002', fullName: 'Đỗ Anh Dũng', username: 'dungda', email: 'dungda@st.edu.vn', phone: '0905555555', role: 'ROLE_STUDENT', departmentName: 'Hệ thống thông tin', departmentId: 2, studentClass: 'DHHTTT17B', active: false }
            ]));
        }

        // BẢNG BỘ MÔN (DEPARTMENTS)
        if (!localStorage.getItem('h2_depts')) {
            localStorage.setItem('h2_depts', JSON.stringify([
                { id: 1, code: 'CNPM', name: 'Công nghệ phần mềm', description: 'Đào tạo Kỹ sư phần mềm, Web & Mobile Apps', headLecturerName: 'TS. Trần Thị Bình', headLecturerId: 2, createdAt: '2026-01-15' },
                { id: 2, code: 'HTTT', name: 'Hệ thống thông tin', description: 'Quản trị CSDL, Big Data & phân tích dữ liệu', headLecturerName: 'ThS. Lê Hoàng Nam', headLecturerId: 3, createdAt: '2026-02-10' },
                { id: 3, code: 'MMT', name: 'Mạng máy tính & An toàn thông tin', description: 'Chuyên ngành An ninh mạng & Cloud Computing', headLecturerName: null, headLecturerId: null, createdAt: '2026-03-01' }
            ]));
        }

        // BẢNG ĐỢT ĐĂNG KÝ (REGISTRATION PERIODS)
        if (!localStorage.getItem('h2_reg_periods')) {
            localStorage.setItem('h2_reg_periods', JSON.stringify([
                {
                    id: 1,
                    name: "Đợt 1 - Khóa luận tốt nghiệp HK1 2026-2027",
                    type: "GRADUATION_THESIS",
                    semester: "HK1",
                    academicYear: "2026-2027",
                    lecturerRegStart: "2026-09-01T08:00:00.000Z",
                    lecturerRegEnd: "2026-09-15T17:00:00.000Z",
                    studentRegStart: "2026-09-20T08:00:00.000Z",
                    studentRegEnd: "2026-09-30T17:00:00.000Z",
                    reviewerDeadline: "2026-11-15",
                    defenseDate: "2026-12-01",
                    status: "PHASE2_STUDENT_REGISTRATION",
                    description: "Đợt KLTN chính thức cho sinh viên năm cuối",
                    createdById: 1,
                    createdByName: "Nguyễn Văn Quản Trị",
                    createdAt: "2026-08-25T10:00:00.000Z",
                    topicCount: 15,
                    groupCount: 12
                },
                {
                    id: 2,
                    name: "Đợt Đăng Ký Đồ Án Môn Học Công Nghệ Phần Mềm",
                    type: "COURSE_PROJECT",
                    semester: "HK1",
                    academicYear: "2026-2027",
                    lecturerRegStart: "2026-10-01T08:00:00.000Z",
                    lecturerRegEnd: "2026-10-10T17:00:00.000Z",
                    studentRegStart: "2026-10-12T08:00:00.000Z",
                    studentRegEnd: "2026-10-20T17:00:00.000Z",
                    reviewerDeadline: "2026-11-30",
                    defenseDate: "2026-12-10",
                    status: "DRAFT",
                    description: "Đồ án môn học dành cho khóa 17",
                    createdById: 1,
                    createdByName: "Nguyễn Văn Quản Trị",
                    createdAt: "2026-09-28T09:00:00.000Z",
                    topicCount: 0,
                    groupCount: 0
                }
            ]));
        }

        // BẢNG ĐỀ TÀI (TOPICS)
        if (!localStorage.getItem('h2_topics')) {
            localStorage.setItem('h2_topics', JSON.stringify([
                {
                    id: 1,
                    code: "DT001",
                    titleVi: "Xây dựng hệ thống Quản lý Đề tài Sinh viên Khoa CNTT",
                    titleEn: "Student Topic Management System for FIT",
                    description: "Hệ thống quản lý quy trình đăng ký, duyệt và bảo vệ đề tài",
                    requirements: "Thành thạo Spring Boot, RESTful API và HTML/CSS/JS",
                    maxStudents: 3,
                    departmentId: 1,
                    departmentName: "Công nghệ phần mềm",
                    periodId: 1,
                    periodName: "Đợt 1 - Khóa luận tốt nghiệp HK1 2026-2027",
                    primaryAdvisorId: 2,
                    primaryAdvisorName: "TS. Trần Thị Bình",
                    primaryAdvisorEmail: "binhtt@fit.edu.vn",
                    coAdvisorId: 3,
                    coAdvisorName: "ThS. Lê Hoàng Nam",
                    coAdvisorEmail: "namlh@fit.edu.vn",
                    approvalStatus: "APPROVED",
                    rejectionReason: "",
                    approvedById: 3,
                    approvedByName: "ThS. Lê Hoàng Nam",
                    approvedAt: "2026-09-28T10:00:00.000Z",
                    isAssigned: false,
                    assignedGroupId: null,
                    assignedGroupName: null,
                    createdAt: "2026-09-25T08:00:00.000Z"
                },
                {
                    id: 2,
                    code: "DT002",
                    titleVi: "Ứng dụng trí tuệ nhân tạo trong phát hiện gian lận thi trực tuyến",
                    titleEn: "AI Application in Online Exam Fraud Detection",
                    description: "Nghiên cứu mô hình AI nhận diện khuôn mặt và hành vi bất thường",
                    requirements: "Kiến thức về Python, OpenCV và Deep Learning",
                    maxStudents: 2,
                    departmentId: 2,
                    departmentName: "Hệ thống thông tin",
                    periodId: 1,
                    periodName: "Đợt 1 - Khóa luận tốt nghiệp HK1 2026-2027",
                    primaryAdvisorId: 3,
                    primaryAdvisorName: "ThS. Lê Hoàng Nam",
                    primaryAdvisorEmail: "namlh@fit.edu.vn",
                    coAdvisorId: null,
                    coAdvisorName: null,
                    coAdvisorEmail: null,
                    approvalStatus: "PENDING",
                    rejectionReason: "",
                    approvedById: null,
                    approvedByName: null,
                    approvedAt: null,
                    isAssigned: false,
                    assignedGroupId: null,
                    assignedGroupName: null,
                    createdAt: "2026-09-29T09:00:00.000Z"
                }
            ]));
        }
    }

    initLocalStorage();

    // 2. PHÂN LẠI LỆNH FETCH VÀ XỬ LÝ AN TOÀN
    window.fetch = async function (url, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const urlStr = url.toString();

        // Giả lập độ trễ mạng 100ms
        await new Promise(resolve => setTimeout(resolve, 100));

        // Hàm hỗ trợ parse JSON body an toàn
        const parseBody = () => {
            try {
                return options.body ? JSON.parse(options.body) : {};
            } catch (e) {
                return {};
            }
        };

        // Hàm tạo Response an toàn
        const makeRes = (data, status = 200) => new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });

        try {
            // A. API AUTH
            if (urlStr.includes('/api/auth/me')) {
                return makeRes({
                    success: true,
                    data: {
                        id: 1, code: 'ADMIN01', fullName: 'Nguyễn Văn Quản Trị', username: 'admin',
                        email: 'admin@fit.edu.vn', phone: '0901111111', role: 'ROLE_ADMIN',
                        departmentName: 'Công nghệ thông tin', studentClass: 'N/A'
                    }
                });
            }
            if (urlStr.includes('/api/auth/login')) {
                return makeRes({ success: true, message: "Đăng nhập thành công", data: { token: "mock-jwt-token-admin-2026" } });
            }
            if (urlStr.includes('/api/auth/register')) {
                return makeRes({ success: true, message: "Đăng ký thành công!" });
            }

            // B. API USERS
            if (urlStr.includes('/api/users')) {
                let users = JSON.parse(localStorage.getItem('h2_users')) || [];

                if (urlStr.includes('/lecturers/department/')) {
                    const deptId = parseInt(urlStr.split('/').pop());
                    const lecturers = users.filter(u => u.departmentId === deptId && (u.role === 'ROLE_LECTURER' || u.role === 'ROLE_DEPARTMENT_HEAD'));
                    return makeRes({ success: true, data: lecturers });
                }

                if (method === 'GET') {
                    const matchDetail = urlStr.match(/\/api\/users\/(\d+)/);
                    if (matchDetail) {
                        const user = users.find(u => u.id === parseInt(matchDetail[1]));
                        return makeRes({ success: true, data: user });
                    }

                    const urlObj = new URL(urlStr, window.location.origin);
                    const roleParam = urlObj.searchParams.get('role');
                    const deptParam = urlObj.searchParams.get('departmentId');
                    const kwParam = urlObj.searchParams.get('keyword');

                    let filtered = [...users];
                    if (roleParam) filtered = filtered.filter(u => u.role === roleParam);
                    if (deptParam) filtered = filtered.filter(u => u.departmentId === parseInt(deptParam));
                    if (kwParam) {
                        const kw = kwParam.toLowerCase();
                        filtered = filtered.filter(u =>
                            (u.fullName && u.fullName.toLowerCase().includes(kw)) ||
                            (u.username && u.username.toLowerCase().includes(kw)) ||
                            (u.code && u.code.toLowerCase().includes(kw))
                        );
                    }
                    return makeRes({ success: true, data: filtered });
                }

                if (method === 'POST') {
                    const body = parseBody();
                    const maxId = users.reduce((max, u) => u.id > max ? u.id : max, 0);
                    const newUser = {
                        ...body,
                        id: maxId + 1,
                        active: true,
                        departmentName: body.departmentId ? `Bộ môn ${body.departmentId}` : 'Chưa phân công'
                    };
                    users.unshift(newUser);
                    localStorage.setItem('h2_users', JSON.stringify(users));
                    return makeRes({ success: true, message: "Tạo người dùng thành công" });
                }

                if (method === 'PUT') {
                    const match = urlStr.match(/\/api\/users\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const body = parseBody();
                        users = users.map(u => u.id === id ? { ...u, ...body } : u);
                        localStorage.setItem('h2_users', JSON.stringify(users));
                        return makeRes({ success: true, message: "Cập nhật thành công" });
                    }
                }

                if (method === 'DELETE') {
                    const match = urlStr.match(/\/api\/users\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        users = users.filter(u => u.id !== id);
                        localStorage.setItem('h2_users', JSON.stringify(users));
                        return makeRes({ success: true, message: "Xóa thành công" });
                    }
                }
            }

            // C. API DEPARTMENTS
            if (urlStr.includes('/api/departments')) {
                let depts = JSON.parse(localStorage.getItem('h2_depts')) || [];

                if (method === 'GET') {
                    const matchDetail = urlStr.match(/\/api\/departments\/(\d+)/);
                    if (matchDetail) {
                        const dept = depts.find(d => d.id === parseInt(matchDetail[1]));
                        return makeRes({ success: true, data: dept });
                    }
                    return makeRes({ success: true, data: depts });
                }

                if (method === 'POST') {
                    const body = parseBody();
                    const maxId = depts.reduce((max, d) => d.id > max ? d.id : max, 0);
                    const newDept = {
                        ...body,
                        id: maxId + 1,
                        headLecturerName: body.headLecturerId ? `Giảng viên (ID: ${body.headLecturerId})` : null,
                        createdAt: new Date().toISOString().split('T')[0]
                    };
                    depts.unshift(newDept);
                    localStorage.setItem('h2_depts', JSON.stringify(depts));
                    return makeRes({ success: true, message: "Tạo bộ môn thành công" });
                }

                if (method === 'PUT') {
                    const match = urlStr.match(/\/api\/departments\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const body = parseBody();
                        depts = depts.map(d => d.id === id ? { ...d, ...body } : d);
                        localStorage.setItem('h2_depts', JSON.stringify(depts));
                        return makeRes({ success: true, message: "Cập nhật bộ môn thành công" });
                    }
                }

                if (method === 'DELETE') {
                    const match = urlStr.match(/\/api\/departments\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        depts = depts.filter(d => d.id !== id);
                        localStorage.setItem('h2_depts', JSON.stringify(depts));
                        return makeRes({ success: true, message: "Xóa bộ môn thành công" });
                    }
                }
            }

            // D. API REGISTRATION PERIODS
            if (urlStr.includes('/api/registration-periods')) {
                let periods = JSON.parse(localStorage.getItem('h2_reg_periods')) || [];

                if (method === 'PATCH' && urlStr.includes('/status')) {
                    const match = urlStr.match(/\/api\/registration-periods\/(\d+)\/status/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const body = parseBody();
                        periods = periods.map(p => p.id === id ? { ...p, status: body.status } : p);
                        localStorage.setItem('h2_reg_periods', JSON.stringify(periods));
                        return makeRes({ success: true, message: "Cập nhật trạng thái thành công" });
                    }
                }

                if (method === 'GET') {
                    const matchDetail = urlStr.match(/\/api\/registration-periods\/(\d+)/);
                    if (matchDetail) {
                        const period = periods.find(p => p.id === parseInt(matchDetail[1]));
                        return makeRes({ success: true, data: period });
                    }

                    const urlObj = new URL(urlStr, window.location.origin);
                    const typeParam = urlObj.searchParams.get('type');
                    const statusParam = urlObj.searchParams.get('status');

                    let filtered = [...periods];
                    if (typeParam) filtered = filtered.filter(p => p.type === typeParam);
                    if (statusParam) filtered = filtered.filter(p => p.status === statusParam);

                    return makeRes({ success: true, data: filtered });
                }

                if (method === 'POST') {
                    const body = parseBody();
                    const maxId = periods.reduce((max, p) => p.id > max ? p.id : max, 0);
                    const newPeriod = {
                        ...body,
                        id: maxId + 1,
                        status: "DRAFT",
                        createdById: 1,
                        createdByName: "Admin",
                        createdAt: new Date().toISOString(),
                        topicCount: 0,
                        groupCount: 0
                    };
                    periods.unshift(newPeriod);
                    localStorage.setItem('h2_reg_periods', JSON.stringify(periods));
                    return makeRes({ success: true, message: "Tạo đợt đăng ký thành công" });
                }

                if (method === 'PUT') {
                    const match = urlStr.match(/\/api\/registration-periods\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const body = parseBody();
                        periods = periods.map(p => p.id === id ? { ...p, ...body } : p);
                        localStorage.setItem('h2_reg_periods', JSON.stringify(periods));
                        return makeRes({ success: true, message: "Cập nhật thành công" });
                    }
                }

                if (method === 'DELETE') {
                    const match = urlStr.match(/\/api\/registration-periods\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        periods = periods.filter(p => p.id !== id);
                        localStorage.setItem('h2_reg_periods', JSON.stringify(periods));
                        return makeRes({ success: true, message: "Xóa đợt đăng ký thành công" });
                    }
                }
            }

            // E. API TOPICS
            if (urlStr.includes('/api/topics')) {
                let topics = JSON.parse(localStorage.getItem('h2_topics')) || [];

                if (urlStr.includes('/published')) {
                    const published = topics.filter(t => t.approvalStatus === 'APPROVED');
                    return makeRes({ success: true, data: published });
                }

                if (method === 'PATCH' && urlStr.includes('/approval')) {
                    const match = urlStr.match(/\/api\/topics\/(\d+)\/approval/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const body = parseBody();
                        topics = topics.map(t => t.id === id ? {
                            ...t,
                            approvalStatus: body.approvalStatus,
                            rejectionReason: body.rejectionReason || '',
                            approvedById: 1,
                            approvedByName: "Admin",
                            approvedAt: new Date().toISOString()
                        } : t);
                        localStorage.setItem('h2_topics', JSON.stringify(topics));
                        return makeRes({ success: true, message: "Phê duyệt thành công" });
                    }
                }

                if (method === 'GET') {
                    const matchDetail = urlStr.match(/\/api\/topics\/(\d+)/);
                    if (matchDetail) {
                        const topic = topics.find(t => t.id === parseInt(matchDetail[1]));
                        return makeRes({ success: true, data: topic });
                    }

                    const urlObj = new URL(urlStr, window.location.origin);
                    const pId = urlObj.searchParams.get('periodId');
                    const dId = urlObj.searchParams.get('departmentId');
                    const st = urlObj.searchParams.get('status');
                    const kw = urlObj.searchParams.get('keyword');

                    let filtered = [...topics];
                    if (pId) filtered = filtered.filter(t => t.periodId === parseInt(pId));
                    if (dId) filtered = filtered.filter(t => t.departmentId === parseInt(dId));
                    if (st) filtered = filtered.filter(t => t.approvalStatus === st);
                    if (kw) {
                        const k = kw.toLowerCase();
                        filtered = filtered.filter(t =>
                            (t.titleVi && t.titleVi.toLowerCase().includes(k)) ||
                            (t.code && t.code.toLowerCase().includes(k))
                        );
                    }

                    return makeRes({ success: true, data: filtered });
                }

                if (method === 'POST') {
                    const body = parseBody();
                    const maxId = topics.reduce((max, t) => t.id > max ? t.id : max, 0);
                    const newTopic = {
                        ...body,
                        id: maxId + 1,
                        code: `DT00${maxId + 1}`,
                        primaryAdvisorId: 2,
                        primaryAdvisorName: "TS. Trần Thị Bình",
                        primaryAdvisorEmail: "binhtt@fit.edu.vn",
                        departmentName: body.departmentId === 1 ? "Công nghệ phần mềm" : "Hệ thống thông tin",
                        periodName: "Đợt 1 - Khóa luận tốt nghiệp HK1 2026-2027",
                        approvalStatus: "PENDING",
                        rejectionReason: "",
                        isAssigned: false,
                        createdAt: new Date().toISOString()
                    };
                    topics.unshift(newTopic);
                    localStorage.setItem('h2_topics', JSON.stringify(topics));
                    return makeRes({ success: true, message: "Đề xuất đề tài thành công" });
                }

                if (method === 'PUT') {
                    const match = urlStr.match(/\/api\/topics\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        const body = parseBody();
                        topics = topics.map(t => t.id === id ? { ...t, ...body } : t);
                        localStorage.setItem('h2_topics', JSON.stringify(topics));
                        return makeRes({ success: true, message: "Cập nhật thành công" });
                    }
                }

                if (method === 'DELETE') {
                    const match = urlStr.match(/\/api\/topics\/(\d+)/);
                    if (match) {
                        const id = parseInt(match[1]);
                        topics = topics.filter(t => t.id !== id);
                        localStorage.setItem('h2_topics', JSON.stringify(topics));
                        return makeRes({ success: true, message: "Xóa thành công" });
                    }
                }
            }

            // Gọi fetch gốc nếu URL không liên quan API
            return originalFetch(url, options);
        } catch (err) {
            console.error("Lỗi Mock API Interceptor:", err);
            return makeRes({ success: false, message: "Lỗi xử lý Mock API" }, 500);
        }
    };
})();