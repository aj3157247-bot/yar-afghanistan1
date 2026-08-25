export function onRequestGet(context) {
  return Response.json({ success:true, service:'yar-afghanistan-api', time:new Date().toISOString(), database:!!context.env.DB, openrouter:!!context.env.OPENROUTER_API_KEY });
}
