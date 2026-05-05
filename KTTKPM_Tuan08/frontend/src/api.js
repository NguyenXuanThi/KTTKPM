// Frontend chỉ gọi vào 1 service duy nhất: Booking Service (API Gateway)
// Booking Service sẽ proxy request đến các service khác
const API = {
    GATEWAY: `http://192.168.137.102:8083/api`,
};

export default API;
