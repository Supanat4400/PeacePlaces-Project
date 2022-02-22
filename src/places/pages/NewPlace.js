import React, { useContext } from "react";

import { useHistory } from "react-router-dom";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { AuthContext } from "../../shared/context/auth-context";
import { useForm } from "../../shared/components/hooks/form-hook";
import { useHttpClient } from "../../shared/components/hooks/http-hook";
import "./PlaceForm.css";

function NewPlace() {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const history = useHistory(); // use for redirecting page

  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      formData.append("imgUrl", formState.inputs.image.value);
      await sendRequest(process.env.REACT_APP_BACKEND_URL + "/places", "POST", formData, {
        Authorization: "Bearer " + auth.token 
      });
     
      history.push("/"); /// redirect to page "/"
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          type="text"
          label="Title"
          element="input"
          errText="Please enter a valid title"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
        />
        <Input
          id="description"
          type="text"
          label="Description"
          element="textarea"
          errText="Please enter a valid description at least 5 characters"
          validators={[VALIDATOR_MINLENGTH(5)]}
          onInput={inputHandler}
        />

        <Input
          id="address"
          type="text"
          label="Address"
          element="input"
          errText="Please enter a valid address"
          validators={[VALIDATOR_REQUIRE()]}
          onInput={inputHandler}
        />
        <ImageUpload center id="image" onInput={inputHandler} />

        <Button type="submit" disabled={!formState.isValid}>
          Add new place
        </Button>
      </form>
    </React.Fragment>
  );
}

export default NewPlace;
