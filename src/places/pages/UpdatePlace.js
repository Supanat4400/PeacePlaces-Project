import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElement/Card";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useHttpClient } from "../../shared/components/hooks/http-hook";
import { useForm } from "../../shared/components/hooks/form-hook";
import { useHistory } from "react-router-dom/";
import { AuthContext } from "../../shared/context/auth-context";

import "./PlaceForm.css";

function UpdatePlace() {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const auth = useContext(AuthContext);

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlacesByUserId = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
        );
        setLoadedPlace(responseData.placeFound);
        setFormData(
          {
            title: {
              value: responseData.placeFound.title,
              isValid: true,
            },
            description: {
              value: responseData.placeFound.description,
              isValid: true,
            },
          },
          true
        );
      } catch (err) {}
    };

    fetchPlacesByUserId();
  }, [sendRequest, placeId, setFormData]);

  const history = useHistory(); // use for redirecting page
  const placeUpdateHandler = async (event) => {
    // console.log(formState.inputs);
    event.preventDefault();
    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-type": "application/json",

          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/" + auth.userId + "/places"); /// redirect to page "/"
    } catch (err) {}
  };

  if (!loadedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateHandler}>
          {isLoading && <LoadingSpinner asOverlay />}
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            errText="Please enter the valid title"
            validators={[VALIDATOR_REQUIRE()]}
            onInput={inputHandler}
            initValue={loadedPlace.title}
            initIsValid={true}
          />

          <Input
            id="description"
            element="textarea"
            label="Description"
            errText="Please enter the valid description at least 5 characters"
            validators={[VALIDATOR_MINLENGTH(5)]}
            onInput={inputHandler}
            initValue={loadedPlace.description}
            initIsValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            Update place
          </Button>
        </form>
      )}
    </React.Fragment>
  );
}
export default UpdatePlace;
