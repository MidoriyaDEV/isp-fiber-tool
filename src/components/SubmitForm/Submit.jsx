import React, { useState } from "react";
import { Button } from "react-bootstrap";
import SubmitForm from "./SubmitForm";

const Submit = () => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
      <Button variant="dark" className="add-button" onClick={handleShow}>
        Adicionar Conexão
      </Button>

      <SubmitForm show={show} handleClose={handleClose} />
    </div>
  );
};

export default Submit;
