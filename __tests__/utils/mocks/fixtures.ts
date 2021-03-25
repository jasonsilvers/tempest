export const grants = [
  { action: "create:any", attributes: "*", resource: "record", role: "admin" },
  { action: "read:any", attributes: "*", resource: "profile", role: "member" },
  {
    action: "read:any",
    attributes: "*",
    resource: "dashboard",
    role: "monitor",
  },
  { action: "read:any", attributes: "*", resource: "profile", role: "admin" },
  {
    action: "read:any",
    attributes: "*",
    resource: "training_record",
    role: "monitor",
  },
  {
    action: "read:any",
    attributes: "*",
    resource: "training_record",
    role: "admin",
  },
];
