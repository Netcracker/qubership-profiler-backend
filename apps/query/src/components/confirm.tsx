import { confirmApiFactory } from '@app/components/compat';

const { ConfirmMountPoint, confirm, confirmDelete, destroyConfirm, updateConfirm, asyncConfirm } = confirmApiFactory();

export default ConfirmMountPoint;

export { confirm, confirmDelete, destroyConfirm, updateConfirm, asyncConfirm };
