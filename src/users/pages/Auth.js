import React, { useState, useContext } from "react";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import { useForm } from "../../shared/components/hooks/form-hook";
import Card from "../../shared/components/UIElement/Card";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import ImageUpload from "../../shared/components/FormElements/ImageUpload"
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/components/hooks/http-hook";

import "./Auth.css";



function Auth() {
  const auth = useContext(AuthContext);

  const [isLoginMode, setIsLoginMode] = useState(true);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  async function authSubmitHandler(event) {
    event.preventDefault();
    // console.log(formState.inputs);
    if (isLoginMode) {
      console.log(process.env.REACT_APP_BACKEND_URL);
      try {
         const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          { "Content-type": "application/json" }
        );

        auth.login(responseData.userId, responseData.token);
      } catch (err) {

      }
    } else {
      try {
       const formData = new FormData();
       formData.append("name", formState.inputs.name.value);
       formData.append("email", formState.inputs.email.value);
       formData.append("password", formState.inputs.password.value);
       formData.append("imgUrl", formState.inputs.image.value)
       const responseData =  await sendRequest(
          process.env.REACT_APP_BACKEND_URL+ "/users/signup",
           "POST",formData); // formData automatically add the right header, so we dont need to add the headers (referring to the outline of the useHttpClient)
       
           auth.login(responseData.userId, responseData.token);
      
      } catch (err) {
      
        
      }
    }
  }

  function switchModeHandler() {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image:undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },image:{
            value:null,
            isValid:false
          }
        },
        false
      );
    }

    setIsLoginMode((prevMode) => !prevMode);
  }



  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        {isLoginMode ? <h2>Login required !</h2> : <h2>Please Sign up.</h2>}
        <hr />
        <form onSubmit={authSubmitHandler}>
        {!isLoginMode && <ImageUpload center id="image" onInput={inputHandler}/>}
          {!isLoginMode && (
            <Input
              id="name"
              type="text"
              label="User Name"
              element="input"
              errText="Please enter a valid username."
              placeholder="Enter a username."
              validators={[VALIDATOR_REQUIRE()]}
              onInput={inputHandler}
            />
          )}
            
          <Input
            id="email"
            type="text"
            label="E-mail"
            element="input"
            errText="Please enter a valid e-mail address."
            placeholder="a123@mail.com"
            validators={[VALIDATOR_EMAIL()]}
            onInput={inputHandler}
          />

          <Input
            id="password"
            type ="password"
            label="Password"
            element="input"
            errText="Please enter a valid password at least 6 characters."
            validators={[VALIDATOR_REQUIRE(), VALIDATOR_MINLENGTH(6)]}
            onInput={inputHandler}
            placeholder="Enter a password."
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          Switch to {isLoginMode ? "Sign up" : "Sign in"}
        </Button>
      </Card>
    </React.Fragment>
  );
}

export default Auth;
