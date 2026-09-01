import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "./Firebase";
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp } from "firebase/firestore";
import emailjs from "@emailjs/browser";

// ─── Context ─────────────────────────────────────────────────────────────────
export const CustomerAuthContext = createContext(null);

export const useCustomerAuth = () => {
    const ctx = useContext(CustomerAuthContext);
    if (!ctx) throw new Error("useCustomerAuth must be used inside CustomerAuthProvider");
    return ctx;
};

// ─── OTP Send Helper ──────────────────────────────────────────────────────────
export const sendOTPEmail = async (email, otp, name = "") => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;   // template_otp
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, {
            to_email: email,
            to_name: name || email,
            otp_code: otp,
            project_name: "Pasoja Atelier",
            logo_url: "https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png",
            website_url: "https://pasoja.in",
            support_email: "pasoja.help@gmail.com",
            reply_to: "pasoja.help@gmail.com",
        }, publicKey);
    } else {
        // Dev-mode fallback: log to console when EmailJS is not configured
        console.log(`[Dev OTP] Login code for ${email}: ${otp}`);
    }
};

// ─── Lookup customer by email ─────────────────────────────────────────────────
export const findCustomerByEmail = async (email) => {
    const q = query(collection(db, "customers"), where("email", "==", email.toLowerCase().trim()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ─── Provider ─────────────────────────────────────────────────────────────────
const CustomerAuthProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);

    // Rehydrate session from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("pasoja_customer_session");
            if (saved) setCustomer(JSON.parse(saved));
        } catch (_) { }
        setLoadingCustomer(false);
    }, []);

    // Login: called after OTP is verified — store session
    const customerLogin = (customerData) => {
        const session = {
            id: customerData.id,
            email: customerData.email,
            name: customerData.name || customerData.fullName || "",
            phone: customerData.phone || "",
            address: customerData.address || "",
            city: customerData.city || "",
            state: customerData.state || "",
            pincode: customerData.pincode || "",
        };
        localStorage.setItem("pasoja_customer_session", JSON.stringify(session));
        setCustomer(session);
    };

    // Logout
    const customerLogout = () => {
        localStorage.removeItem("pasoja_customer_session");
        setCustomer(null);
    };

    const value = { customer, loadingCustomer, customerLogin, customerLogout, findCustomerByEmail, sendOTPEmail };
    return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
};

export default CustomerAuthProvider;
