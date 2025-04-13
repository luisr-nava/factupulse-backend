import { Injectable, Logger } from '@nestjs/common';
import { ShopCategories } from 'src/shop/category/entities/category.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CategorySeeder {
  constructor(private readonly dataSource: DataSource) {}

  private readonly logger = new Logger(CategorySeeder.name);

  private readonly defaultCategories = [
    'Almacén / Supermercado',
    'Electrónica',
    'Ropa / Indumentaria',
    'Restaurante',
    'Belleza / Estética',
    'Farmacia',
    'Deportes',
    'Hogar / Decoración',
    'Juguetería',
    'Librería',
  ];

  async run() {
    const repo = this.dataSource.getRepository(ShopCategories);

    for (const name of this.defaultCategories) {
      const exists = await repo.findOne({
        where: { name, owner: null },
      });

      if (!exists) {
        const newCat = repo.create({
          name,
          owner: null, // <- default global
        });

        await repo.save(newCat);
        this.logger.log(`✔️ Inserted category: ${name}`);
      } else {
        this.logger.log(`⏩ Already exists: ${name}`);
      }
    }
  }
}
