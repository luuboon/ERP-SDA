import {
  Directive, Input, OnDestroy,
  TemplateRef, ViewContainerRef, inject, effect
} from '@angular/core';
import { PermissionService } from '../../application/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private templateRef     = inject(TemplateRef<unknown>);
  private viewContainer   = inject(ViewContainerRef);
  private permissionSvc   = inject(PermissionService);

  private _permission = '';
  private _hasView    = false;

  @Input()
  set appHasPermission(permission: string) {
    this._permission = permission;
    this.updateView();
  }

  constructor() {
    // Reaccionar reactivamente cuando cambien los permisos efectivos
    // (cuando el usuario cambia de grupo)
    effect(() => {
      // Leer el signal para suscribirse a cambios
      this.permissionSvc.effectivePermissions();
      this.updateView();
    });
  }

  private updateView(): void {
    if (this.permissionSvc.hasPermission(this._permission)) {
      if (!this._hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this._hasView = true;
      }
    } else {
      if (this._hasView) {
        this.viewContainer.clear();
        this._hasView = false;
      }
    }
  }
}
