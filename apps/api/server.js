const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/health", async (req, res) => {
  res.json({ ok: true, service: "api" });
});

app.get("/contacts", async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.get("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
});

app.post("/contacts", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
      },
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to create contact" });
  }
});

app.patch("/contacts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, email, phone } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid contact ID" });
    }

    const existing = await prisma.contact.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Contact not found" });
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        email: email ?? existing.email,
        phone: phone ?? existing.phone,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);

    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to update contact" });
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("API running on port 3001");
});