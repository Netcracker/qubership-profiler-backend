import { confirmApiFactory } from '@app/utils/confirm';

const { ConfirmMountPoint, confirm, confirmDelete, destroyConfirm, updateConfirm, asyncConfirm } = confirmApiFactory();

export default ConfirmMountPoint;

export { confirm, confirmDelete, destroyConfirm, updateConfirm, asyncConfirm };
