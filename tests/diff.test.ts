import { parseDiffLines } from '../src/diff'

test('parse single diff', () => {
  const fixture = `\
diff --git a/tmp/kustomize-action-td0BL2/config/default/apps_v1_deployment_argocd-commenter-controller-manager.yaml b/tmp/kustomize-action-F1O9dM/config/default/apps_v1_deployment_argocd-commenter-controller-manager.yaml
index 6ff0827..59426b2 100644
--- a/tmp/kustomize-action-td0BL2/config/default/apps_v1_deployment_argocd-commenter-controller-manager.yaml
+++ b/tmp/kustomize-action-F1O9dM/config/default/apps_v1_deployment_argocd-commenter-controller-manager.yaml
@@ -61,10 +61,10 @@ spec:
           periodSeconds: 10
         resources:
           limits:
-            memory: 48Mi
+            memory: 64Mi
           requests:
             cpu: 10m
-            memory: 48Mi
+            memory: 64Mi
         securityContext:
           allowPrivilegeEscalation: false
       securityContext:
`.split('\n')
  const base = '/tmp/kustomize-action-td0BL2'
  const head = '/tmp/kustomize-action-F1O9dM'
  const diffs = parseDiffLines(fixture, base, head)
  expect(diffs.length).toBe(1)
  expect(diffs[0].baseRelativePath).toBe('/config/default/apps_v1_deployment_argocd-commenter-controller-manager.yaml')
  expect(diffs[0].headRelativePath).toBe('/config/default/apps_v1_deployment_argocd-commenter-controller-manager.yaml')
})
