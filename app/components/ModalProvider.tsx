"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "ALERT" | "CONFIRM" | null;

interface ModalContextType {
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [onConfirmCb, setOnConfirmCb] = useState<(() => void) | null>(null);

  const showAlert = (t: string, m: string) => {
    setTitle(t);
    setMessage(m);
    setModalType("ALERT");
  };

  const showConfirm = (t: string, m: string, cb: () => void) => {
    setTitle(t);
    setMessage(m);
    setOnConfirmCb(() => cb);
    setModalType("CONFIRM");
  };

  const closeModal = () => {
    setModalType(null);
    setTitle("");
    setMessage("");
    setOnConfirmCb(null);
  };

  const handleConfirm = () => {
    if (onConfirmCb) onConfirmCb();
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {modalType && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          backdropFilter: "blur(4px)"
        }}>
          <div className="card rainbow-border" style={{ 
            maxWidth: "400px", 
            width: "90%", 
            padding: "2rem",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <h3 className="mb-2">{title}</h3>
            <p className="mb-4 text-muted">{message}</p>
            
            <div className="flex gap-2 justify-end mt-4">
              {modalType === "CONFIRM" && (
                <button onClick={closeModal} className="btn btn-outline" style={{ padding: "0.5rem 1rem" }}>
                  Cancel
                </button>
              )}
              <button 
                onClick={modalType === "CONFIRM" ? handleConfirm : closeModal} 
                className="btn btn-primary" 
                style={{ padding: "0.5rem 1.5rem" }}
              >
                {modalType === "CONFIRM" ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
