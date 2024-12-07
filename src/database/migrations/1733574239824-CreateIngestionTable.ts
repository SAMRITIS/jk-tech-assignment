import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIngestionTable1733574239824 implements MigrationInterface {
    name = 'CreateIngestionTable1733574239824'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_a7435dbb7583938d5e7d1376041"`);
        await queryRunner.query(`CREATE TABLE "ingestion_processes" ("id" SERIAL NOT NULL, "document_id" integer NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "started_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0bfedab5e639bdc628224475f4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "files" DROP CONSTRAINT "FK_a7435dbb7583938d5e7d1376041"`);
        await queryRunner.query(`DROP TABLE "ingestion_processes"`);
        await queryRunner.query(`ALTER TABLE "files" ADD CONSTRAINT "FK_a7435dbb7583938d5e7d1376041" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
