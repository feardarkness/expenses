export interface CRUD {
  list: (params: object, association?: any) => Promise<any>;
  create: (resource: any, association?: any) => Promise<any>;
  updateById: (resourceId: any, dataToUpdate: any, association?: any) => Promise<any>;
  findById: (resourceId: any, association?: any) => Promise<any>;
  deleteById: (resourceId: any, association?: any) => Promise<any>;
  patchById?: (resourceId: any, association?: any) => Promise<any>;
}
