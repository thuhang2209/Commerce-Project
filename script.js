
// ĐỊA CHỈ SERVER CỦA BẠN (Dựa theo file server bạn cung cấp)
const API_URL = 'http://localhost:3000/api'; 

let products = []; // Biến lưu danh sách sản phẩm tải từ server
let cart = [];     // Biến lưu giỏ hàng tạm thời

// ==============================================
// 1. KẾT NỐI SERVER (GỌI API)
// ==============================================

// Hàm tải danh sách điện thoại từ Server
async function fetchProducts() {
    // Hiện chữ "Đang tải..."
    const loading = document.getElementById('loading');
    if(loading) loading.classList.remove('hidden');

    try {
        // Gửi lệnh GET tới server
        const response = await fetch(`${API_URL}/phones`);
        
        // Nếu kết nối thất bại
        if (!response.ok) throw new Error('Lỗi kết nối Server');

        // Lấy dữ liệu JSON
        const data = await response.json();
        
        // Kiểm tra xem server trả về mảng hay object {data: []}
        if (Array.isArray(data)) {
            products = data;
        } else if (data.data && Array.isArray(data.data)) {
            products = data.data;
        } else if (data.phones && Array.isArray(data.phones)) {
            products = data.phones;
        } else {
            products = [];
        }

        // Vẽ lại giao diện
        renderCustomerView();
        renderAdminTable();
        
        // Tải báo cáo ngay sau khi có dữ liệu sản phẩm
        fetchReports();

    } catch (error) {
        console.error('Lỗi:', error);
        showToast('Không kết nối được Server (Port 3000)!', true);
    } finally {
        // Ẩn chữ "Đang tải..."
        if(loading) loading.classList.add('hidden');
    }
}

// Hàm tải báo cáo (Thông minh: Nếu Server lỗi thì tự tính)
async function fetchReports() {
    let stats = {
        totalPhones: 0,
        totalValue: 0,
        outOfStock: 0
    };

    try {
        // Thử gọi API từ server
        const response = await fetch(`${API_URL}/reports/summary`);
        if (response.ok) {
            stats = await response.json();
        } else {
            throw new Error('API Report không khả dụng');
        }
    } catch (e) {
        // Nếu API lỗi (hoặc server chưa cài), tự tính toán tại trình duyệt
        console.log('Server chưa hỗ trợ báo cáo, đang tự tính toán...');
        if (products.length > 0) {
            stats.totalPhones = products.length;
            stats.totalValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity)), 0);
            stats.outOfStock = products.filter(p => p.quantity <= 0).length;
        }
    }

    // Cập nhật giao diện
    const reportPanel = document.getElementById('reports-panel');
    if (reportPanel) {
        reportPanel.innerHTML = `
            <div class="stat-box" style="border-left: 4px solid #0d6efd">
                <h3>${stats.totalPhones || 0}</h3>
                <p>Tổng Sản Phẩm</p>
            </div>
            <div class="stat-box" style="border-left: 4px solid #198754">
                <h3>${formatMoney(stats.totalValue || 0)}</h3>
                <p>Tổng Giá Trị</p>
            </div>
            <div class="stat-box" style="border-left: 4px solid #dc3545">
                <h3>${stats.outOfStock || 0}</h3>
                <p>Hết Hàng</p>
            </div>
        `;
    }
}

// Hàm gửi sản phẩm mới lên Server (POST)
async function addProduct(productData) {
    try {
        const response = await fetch(`${API_URL}/phones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            showToast('Thêm thành công!');
            document.getElementById('add-form').reset(); // Xóa trắng form
            fetchProducts(); // Tải lại danh sách mới (sẽ tự update báo cáo)
        } else {
            showToast('Lỗi khi thêm sản phẩm', true);
        }
    } catch (error) {
        showToast('Lỗi kết nối Server', true);
    }
}

// Hàm xóa sản phẩm trên Server (DELETE)
async function deleteProduct(id) {
    if (!confirm('Bạn chắc chắn muốn xóa?')) return;

    try {
        const response = await fetch(`${API_URL}/phones/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Đã xóa!');
            fetchProducts(); // Tải lại danh sách mới (sẽ tự update báo cáo)
        } else {
            showToast('Không xóa được', true);
        }
    } catch (error) {
        showToast('Lỗi kết nối Server', true);
    }
}

// ==============================================
// 2. XỬ LÝ GIAO DIỆN (DOM)
// ==============================================

// Chạy hàm này đầu tiên khi mở trang web
window.onload = function() {
    console.log('Frontend đã khởi động...');
    fetchProducts(); // Gọi dữ liệu sản phẩm (Báo cáo sẽ được gọi bên trong hàm này)
};

// Hiển thị danh sách cho Khách Hàng
function renderCustomerView() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p class="text-center" style="width:100%">Chưa có sản phẩm nào trong kho.</p>';
        return;
    }

    products.forEach(p => {
        // ID có thể là _id (MongoDB) hoặc id (thường)
        const id = p._id || p.id;
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div>
                <h3 class="p-title">${p.name}</h3>
                <div class="p-brand">Hãng: ${p.brand}</div>
                <div class="p-stock">Còn: <strong>${p.quantity}</strong></div>
                <div class="p-price">${formatMoney(p.price)}</div>
            </div>
            <button onclick="addToCart('${id}')" class="btn-primary width-full" style="margin-top:10px"
                ${p.quantity <= 0 ? 'disabled style="background:gray"' : ''}>
                ${p.quantity > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
            </button>
        `;
        grid.appendChild(card);
    });
}

// Hiển thị bảng quản lý cho Admin
function renderAdminTable() {
    const tbody = document.getElementById('admin-tbody');
    tbody.innerHTML = products.map(p => {
        const id = p._id || p.id;
        return `
            <tr>
                <td>${p.name}<br><small style="color:#666">${p.brand}</small></td>
                <td style="color:red; font-weight:bold">${formatMoney(p.price)}</td>
                <td>${p.quantity}</td>
                <td>
                    <button onclick="deleteProduct('${id}')" class="btn-danger">Xóa</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Tìm kiếm sản phẩm (ngay trên trình duyệt)
function searchProduct() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.p-title').innerText.toLowerCase();
        if (title.includes(keyword)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Bắt sự kiện Form Thêm sản phẩm
const form = document.getElementById('add-form');
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // Ngăn trang web reload
        
        const newProduct = {
            name: document.getElementById('p-name').value,
            brand: document.getElementById('p-brand').value,
            price: Number(document.getElementById('p-price').value),
            quantity: Number(document.getElementById('p-qty').value)
        };
        
        addProduct(newProduct);
    });
}

// Chuyển đổi giữa trang Admin và Khách
function toggleView() {
    document.getElementById('customer-view').classList.toggle('hidden');
    document.getElementById('admin-view').classList.toggle('hidden');
    
    // Nếu đang mở Admin thì tải báo cáo
    if (!document.getElementById('admin-view').classList.contains('hidden')) {
        fetchReports();
    }
}

// ==============================================
// 3. GIỎ HÀNG (Logic Client)
// ==============================================

function addToCart(id) {
    const product = products.find(p => (p._id || p.id) == id);
    if (!product) return;

    // Kiểm tra xem đã có trong giỏ chưa
    const item = cart.find(i => (i._id || i.id) == id);
    const currentQty = item ? item.qty : 0;

    // Kiểm tra tồn kho
    if (product.quantity - currentQty <= 0) {
        showToast('Hết hàng trong kho!', true);
        return;
    }

    if (item) {
        item.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    updateCartUI();
    showToast('Đã thêm vào giỏ');
}

function updateCartUI() {
    // Cập nhật số trên icon
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.qty, 0);
    
    const cartItemsDiv = document.getElementById('cart-items');
    let total = 0;

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="text-center">Giỏ hàng trống</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => {
            total += item.price * item.qty;
            const id = item._id || item.id;
            return `
                <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <div>
                        <strong>${item.name}</strong><br>
                        <small>${formatMoney(item.price)} x ${item.qty}</small>
                    </div>
                    <button onclick="removeFromCart('${id}')" class="btn-danger" style="padding:2px 5px; font-size:12px">Xóa</button>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('cart-total').innerText = formatMoney(total);
}

function removeFromCart(id) {
    cart = cart.filter(i => (i._id || i.id) != id);
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('open');
}

// Thanh toán (Gửi lệnh trừ kho lên Server)
async function checkout() {
    if (cart.length === 0) return showToast('Giỏ hàng trống', true);

    // Gửi từng món hàng lên server để trừ kho
    // Lưu ý: Server cần API Patch Stock để chạy cái này, nếu không thì chỉ hiện thông báo
    try {
        for (const item of cart) {
            const id = item._id || item.id;
            // Gọi API trừ kho (nếu có)
            await fetch(`${API_URL}/phones/${id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: item.qty, operation: 'subtract' })
            });
        }
    } catch (e) {
        console.log('Server có thể chưa hỗ trợ trừ kho tự động.');
    }

    showToast('Thanh toán thành công!');
    cart = []; // Xóa giỏ
    updateCartUI();
    toggleCart(); // Đóng modal
    fetchProducts(); // Tải lại danh sách sản phẩm mới nhất
}

// ==============================================
// 4. TIỆN ÍCH
// ==============================================

// Định dạng tiền VNĐ
function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hiện thông báo (Toast)
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.background = isError ? '#dc3545' : '#198754';
    toast.className = 'show';
    setTimeout(() => {
        toast.className = '';
    }, 3000);
}

// Đóng modal khi click ra ngoài
window.onclick = function(event) {
    const modal = document.getElementById('cart-modal');
    if (event.target == modal) {
        toggleCart();
    }
};