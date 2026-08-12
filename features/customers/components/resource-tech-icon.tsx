"use client";

import type { ComponentType, SVGProps } from "react";
import { Database, Mail } from "lucide-react";
import {
  siDocker,
  siMariadb,
  siMongodb,
  siMysql,
  siPostgresql,
  siRedis,
  type SimpleIcon,
} from "simple-icons";
import { cn } from "@/lib/utils";

type BrandIconProps = SVGProps<SVGSVGElement> & { className?: string };

const DARK_UI_HEX: Partial<Record<string, string>> = {
  mariadb: "2E8FA8",
};

function SimpleBrandIcon(icon: SimpleIcon, props: BrandIconProps, hexOverride?: string) {
  const { className, ...rest } = props;
  const hex = hexOverride ?? DARK_UI_HEX[icon.slug] ?? icon.hex;
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      fill={`#${hex}`}
      aria-hidden
      {...rest}
    >
      <title>{icon.title}</title>
      <path d={icon.path} />
    </svg>
  );
}

function DockerIcon(props: BrandIconProps) {
  return SimpleBrandIcon(siDocker, props);
}

function PostgresqlIcon(props: BrandIconProps) {
  return SimpleBrandIcon(siPostgresql, props);
}

function MysqlIcon(props: BrandIconProps) {
  return SimpleBrandIcon(siMysql, props);
}

function MariadbIcon(props: BrandIconProps) {
  return SimpleBrandIcon(siMariadb, props);
}

function MongodbIcon(props: BrandIconProps) {
  return SimpleBrandIcon(siMongodb, props);
}

function RedisIcon(props: BrandIconProps) {
  return SimpleBrandIcon(siRedis, props);
}

const DATABASE_BRAND_ICONS: Record<string, ComponentType<BrandIconProps>> = {
  postgresql: PostgresqlIcon,
  postgres: PostgresqlIcon,
  mysql: MysqlIcon,
  mariadb: MariadbIcon,
  mongodb: MongodbIcon,
  redis: RedisIcon,
};

export function ResourceTechIcon({
  kind,
  databaseEngine,
  className,
}: {
  kind: string;
  framework?: string | null;
  databaseEngine?: string | null;
  className?: string;
}) {
  const box = cn(
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/80 bg-card p-1.5",
    className
  );
  const normalizedKind = kind.toLowerCase();

  if (normalizedKind === "email") {
    return (
      <span className={box} title="Correo">
        <Mail className="h-full w-full text-primary" />
      </span>
    );
  }

  if (normalizedKind === "database") {
    const engine = (databaseEngine ?? "").trim().toLowerCase();
    const Brand = engine ? DATABASE_BRAND_ICONS[engine] : null;
    if (Brand) {
      return (
        <span className={box} title={databaseEngine || "Database"}>
          <Brand className="h-full w-full" />
        </span>
      );
    }
    return (
      <span className={box} title={databaseEngine || "Base de datos"}>
        <Database className="h-full w-full text-primary" />
      </span>
    );
  }

  return (
    <span className={box} title="Docker">
      <DockerIcon className="h-full w-full" />
    </span>
  );
}
