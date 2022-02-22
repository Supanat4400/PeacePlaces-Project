import React, { useRef, useState, useEffect } from "react";
import Button from "./Button";

import "./ImageUpload.css";

const ImageUpload = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  const filePickerRef = useRef();

  useEffect(()=>{
      if(!file){
          return;
      }else{
          const fileReader = new FileReader();
          fileReader.onload = ()=>{
              setPreviewUrl(fileReader.result);
          };
          fileReader.readAsDataURL(file);
      }
  },[file]);

  const pickImageHandler = () => {
    filePickerRef.current.click();
  };

  const selectedHandler = (event) => {
      let selectedFile;
      let fileIsValid = isValid;
    if(event.target.files && event.target.files.length ===1){
        selectedFile = event.target.files[0];
        setFile(selectedFile);
        setIsValid(true)
        fileIsValid = true;
    }else{
        setIsValid(false);
        fileIsValid = false;
    }
    props.onInput(props.id, selectedFile, fileIsValid)
  };
  return (
    <div className="form-control">
      <input
        ref={filePickerRef}
        id={props.id}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={selectedHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please select an image.</p>}
        </div>
        <Button type="button" onClick={pickImageHandler}>
          Select image
        </Button>
      </div>
      {!isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
