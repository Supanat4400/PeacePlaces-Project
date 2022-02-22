import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useHttpClient } from "../../shared/components/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import PlaceList from "../components/PlaceList";

function UserPlaces() {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    const fetchPlacesByUserId = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/places/user/${userId}`
        );

        setLoadedPlaces(responseData.places);
        // console.log(loadedPlaces);
        
      } catch (err) {}
    };
    fetchPlacesByUserId();
  }, [sendRequest, userId]);

  function placeDeleteHandler(deletePlaceId){
    setLoadedPlaces(prevPlaces => prevPlaces.filter(place=> place.id !== deletePlaceId))
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />}
    </React.Fragment>
  );
}

export default UserPlaces;
