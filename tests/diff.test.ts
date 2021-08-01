import { parseDiffLines } from '../src/diff'

test('parse single diff', async () => {
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
  const diffs = parseDiffLines(fixture)
  expect(diffs.length).toBe(1)
})
