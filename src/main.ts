import { Environment } from "./core/environment";
import gsap from "gsap";
import { Vector3 } from "three";
import { EventListeners } from "./core/EventListeners";
import { SETTINGS } from "./core/Settings";
import type { MapMouseEvent } from "maplibre-gl";
import { SearchBar } from "./ui/searchBar";

const environment: Environment = new Environment((timeStamp: DOMHighResTimeStamp) => {
  environment.earth.clouds.rotation.y += 0.0001;

  environment.controls.update();
  environment.radar.update();
  environment.earth.rotate(timeStamp);

  if(environment.earth.shaders[environment.earth.getCloudsMaterial().uuid]) {
    environment.earth.shaders[
      environment.earth.getCloudsMaterial().uuid
    ].uniforms.time.value = timeStamp;
  }
});

let currentZoomAnimation: gsap.core.Tween = gsap.to({}, {});

new EventListeners(environment);

const searchBar: SearchBar = new SearchBar(environment);

window.addEventListener("mousemove", (event) => {
  environment.updateControlsState(event);
});

window.addEventListener("wheel", () => {
  currentZoomAnimation.kill();
  environment.updateControlsSpeed();
});

window.addEventListener("resize", () => {
  environment.updateDimensions();
});

document.getElementById("resetZoomButton")?.addEventListener("click", () => {
  const object: {distance: number} = {distance: environment.controls.getDistance()};

  currentZoomAnimation.kill();
  
  currentZoomAnimation = gsap.to(object, {
    distance: SETTINGS.CAMERA_START_DISTANCE,
    duration: 1,
    ease: "power1.inOut",
    onUpdate: () => {
      const direction = new Vector3().subVectors(environment.controls.object.position, environment.controls.target).normalize();

      environment.controls.object.position.copy(environment.controls.target.clone().add(direction.multiplyScalar(object.distance)));
      environment.radar.update();
    },
    onComplete: () => {
      environment.updateControlsSpeed();
    }
  });
});

searchBar.input.addEventListener("input", () => {
  searchBar.updateSearchResults();
});

searchBar.container.addEventListener("focusout", (event: FocusEvent) => {
  if(event.relatedTarget && (
    searchBar.container.contains(event.relatedTarget as Node) ||
    searchBar.searchResultsContainer.contains(event.relatedTarget as Node)
  )) {
    return;
  }

  searchBar.stopQuerying();
  searchBar.clearSearchResults();
});

searchBar.input.addEventListener("focusin", () => {
  searchBar.updateSearchResults();
});

environment.radar.on("click", (event: MapMouseEvent) => {
  environment.radar.markImpactSpot({
    latitude: event.lngLat.lat,
    longitude: event.lngLat.lng
  }, 1000);
});