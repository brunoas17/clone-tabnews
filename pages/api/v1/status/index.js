export default function status(request, response) {
  response
    .status(200)
    .json({ message: "Aprender no curso.dev me torna acima da média" });
}
