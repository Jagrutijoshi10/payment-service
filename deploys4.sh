# rename docker file
sed -i 's/staging/stage4/g;s/stage1/stage4/g;s/stage2/stage4/g;s/stage3/stage4/g;' dockerfile
# generate image
docker build -t stage4_umobile_app_payment_management .
# tag image
docker tag stage4_umobile_app_payment_management asia.gcr.io/um-stage-4/stage4_umobile_app_payment_management:v$1
# push image
docker push asia.gcr.io/um-stage-4/stage4_umobile_app_payment_management:v$1