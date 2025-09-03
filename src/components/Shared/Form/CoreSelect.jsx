import React from "react";
import { Form } from "react-bootstrap";

const CoreSelect = ({ name, onChange }) => {
  return (
    <Form.Select name={name} defaultValue={"0"} onChange={onChange}>
      <option value="0">Selecione a quantidade de núcleos de fibra...</option>
      <option value="2">2 núcleos</option>
      <option value="4">4 núcleos</option>
      <option value="8">8 núcleos</option>
      <option value="12">12 núcleos</option>
      <option value="16">16 núcleos</option>
      <option value="24">24 núcleos</option>
    </Form.Select>
  );
};

export default CoreSelect;