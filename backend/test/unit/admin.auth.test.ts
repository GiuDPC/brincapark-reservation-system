import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";

describe("Admin Auth & Demo Mode Logic", () => {
  const MASTER_SECRET = "master_super_secret_2026";
  const DEMO_SECRET = "1234";
  const JWT_SECRET = "test_jwt_secret_key";

  function authenticate(secret: string) {
    if (!secret) return { status: 400, error: "Código de acceso requerido" };
    const isMaster = Boolean(MASTER_SECRET && secret === MASTER_SECRET);
    const isDemo = secret === DEMO_SECRET || secret === "demo";

    if (!isMaster && !isDemo) {
      return { status: 401, error: "Código de acceso incorrecto" };
    }

    const role = isMaster ? "admin" : "demo-admin";
    const token = jwt.sign(
      {
        role,
        isDemo: !isMaster,
        sub: isMaster ? "master-admin" : "demo-user",
      },
      JWT_SECRET,
      { expiresIn: "4h" }
    );

    return {
      status: 200,
      token,
      role,
      isDemo: !isMaster,
      message: isMaster
        ? "Acceso administrativo concedido"
        : "Acceso demo concedido (modo de prueba protegido)",
    };
  }

  it("permite acceso demo con código 1234 y genera JWT de rol demo-admin", () => {
    const res = authenticate("1234");
    expect(res.status).toBe(200);
    expect(res.isDemo).toBe(true);
    expect(res.role).toBe("demo-admin");

    const decoded = jwt.verify(res.token!, JWT_SECRET) as any;
    expect(decoded.role).toBe("demo-admin");
    expect(decoded.isDemo).toBe(true);
  });

  it("permite acceso maestro con clave maestra y genera JWT de rol admin", () => {
    const res = authenticate(MASTER_SECRET);
    expect(res.status).toBe(200);
    expect(res.isDemo).toBe(false);
    expect(res.role).toBe("admin");

    const decoded = jwt.verify(res.token!, JWT_SECRET) as any;
    expect(decoded.role).toBe("admin");
    expect(decoded.isDemo).toBe(false);
  });

  it("rechaza acceso con código inválido", () => {
    const res = authenticate("clave_erronea_xyz");
    expect(res.status).toBe(401);
    expect(res.error).toBe("Código de acceso incorrecto");
  });

  it("rechaza acceso con campo vacío", () => {
    const res = authenticate("");
    expect(res.status).toBe(400);
    expect(res.error).toBe("Código de acceso requerido");
  });
});
