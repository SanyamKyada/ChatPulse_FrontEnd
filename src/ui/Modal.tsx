import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  content: ReactNode;
  // actions: ReactNode;
}

export interface ModalHandle {
  openModal: () => void;
  closeModal: () => void;
}

const Modal = forwardRef<ModalHandle, ModalProps>(({ content }, ref) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    openModal: () => {
      dialogRef.current?.showModal();
    },
    closeModal: () => {
      dialogRef.current?.close();
    },
  }));

  return createPortal(
    <dialog id="modal" ref={dialogRef}>
      {content}
      {/* <div className="modal-actions">{actions}</div> */}
    </dialog>,
    document.querySelector("#modal")!
  );
});

export default Modal;
