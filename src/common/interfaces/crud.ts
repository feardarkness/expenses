export interface CRUD {
  list: (limit: number, page: number) => Promise<any>;
  create: (resource: any, association?: any) => Promise<any>;
  updateById: (resourceId: any, dataToUpdate: any) => Promise<any>;
  findById: (resourceId: any) => Promise<any>;
  deleteById: (resourceId: any) => Promise<any>;
  patchById?: (resourceId: any) => Promise<any>;
}
