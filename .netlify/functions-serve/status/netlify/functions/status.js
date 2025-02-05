// netlify/functions/status.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: "idle" })
    // Replace with actual status logic
  };
};
//# sourceMappingURL=status.js.map
