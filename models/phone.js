/**
 * PHONE MODEL
 * Dinh nghia cau truc va validation cho phone
 */

const { ObjectID } = require("mongodb");
const { getDB } = require("../config/db");

const COLLECTION_NAME = "phonelist";

/**
 * lay collection phonelist
 */

function getCollection() {
  return getDB().collection(COLLECTION_NAME);
}

/**
 * Cau truc cua mot Phone document
 * {
 * _id: ObjectId'
 * name: string,                   // Ten dien thoai ("IPhone15")
 * brand: string, 		  // Hang ("Apple")
 * price: number,         // Gia ban (VND)
 * quantity: number,      // So luong ton kho
 * color: string,         // Mau sac
 * storage: string,       // Dung luong (VD: "128GB", "256GB")
 * ram: string,           // RAM (VD: "8GB")
 * status: string,        // "in_stock" | "low_stock" | "out_of_stock"
 * imeiList: string[],    // Danh sach IMEI
 * createdAt: Date,
 * updatedAt: Date,
 * isDeleted: boolean
 * }
 */

/**
 * Validate du lieu
 */

function validatePhone(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    // Bat buoc khi tao moi
    if (!data.name || data.name.trim() === "") {
      errors.push("Ten dien thoai la bat buoc");
    }
    if (!data.brand || data.brand.trim() === "") {
      errors.push("Hang san xuat la bat buoc");
    }
    if (data.price === undefined || data.price < 0) {
      errors.push("Price must be >= 0");
    }
    if (data.quantity === undefined || data.quantity < 0) {
      errors.push("Quantity must be >= 0");
    }
  }

  // Validate gia tri neu co
  if (
    data.price !== undefined &&
    (typeof data.price !== "number" || data.price < 0)
  ) {
    errors.push("Price must be a valid number >= 0");
  }
  if (
    data.costPrice !== undefined &&
    (typeof data.costPrice !== "number" || data.costPrice < 0)
  ) {
    errors.push("Cost price must be a valid number >= 0");
  }
  if (
    data.quantity !== undefined &&
    (typeof data.quantity !== "number" || data.quantity < 0)
  ) {
    errors.push("Quantity must be a valid number >= 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Tinh trang thai ton kho
 */
function calculateStatus(quantity) {
  if (quantity <= 0) return "out_of_stock";
  if (quantity <= 5) return "low_stock";
  return "in_stock";
}

/**
 * Chuan hoa du lieu truoc khi luu
 */
function normalizePhone(data) {
  const normalized = { ...data };

  // Trim strings
  if (normalized.name) normalized.name = normalized.name.trim();
  if (normalized.brand) normalized.brand = normalized.brand.trim();
  if (normalized.color) normalized.color = normalized.color.trim();

  // Tinh status
  if (normalized.quantity !== undefined) {
    normalized.status = calculateStatus(normalized.quantity);
  }

  return normalized;
}

module.exports = {
  COLLECTION_NAME,
  getCollection,
  validatePhone,
  calculateStatus,
  normalizePhone,
};
