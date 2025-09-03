const routePromise = (directionsService, request) =>
  new Promise((resolve) => {
    directionsService.route(request, (result, status) => {
      if (status === "OK") resolve(result);
      else resolve(null); // resolve null em vez de undefined
    });
  });

const findNearbySplitter = async (from, to, callback) => {
  if (!from || !to) {
    console.error("findNearbySplitter: parâmetros inválidos", { from, to });
    callback([]);
    return;
  }

  const directionsService = new window.google.maps.DirectionsService();
  const request = { origin: from, destination: to, travelMode: "WALKING" };

  const result = await routePromise(directionsService, request);

  if (!result) {
    console.error("findNearbySplitter: rota não encontrada");
    callback([]);
    return;
  }

  const path = result.routes[0].overview_path;
  callback([from, ...path, to]);
};

export default findNearbySplitter;
